const { Op } = require("sequelize");
//
const db = require('../../config/database');
// 
const queryMessage = require('../../helper/queryMessage');
const replyMessage = require('../../utils/constants/replies');
// CONTROLLERS
const { getProductVarientById } = require('../../controllers/consumer/productController');
const sense = 'Cart item';


// "GET" REQUEST TO GET USER CART BY CART ID OR BY USER ID
exports.getCart = async (req, res) => {
    try {
        const id = req.query.id;
        const cart = id ? await getCartById(id, null, res) : await getCartById(null, req.user.id, res);
        if (!cart) return true; // RETURN IF GET SOMETHING WRONG

        const reply = {
            success: true,
            message: queryMessage.listSuccess(sense),
            data: cart
        }
        res.send(reply)
    }
    catch (err) {
        queryMessage.sendErrorMessage(err, res)
    }
}

// "POST" REQUEST TO CREATE USER CART 
exports.create = async (req, res) => {
    try {
        const cartBody = {
            status: 'open',
            userId: req.user.id
        },
            {
                productId,
                productVarientId
            } = req.body;
        var cartId = 0;
        // GET PRODUCT VARIENT
        const productVarient = await getProductVarientById(productId, productVarientId, 1, res);
        if (!productVarient) return true; // RETURN IF GET SOMETHING WRONG OR OUT OF STOCK

        const productPrice = productVarient.updatedPrice || productVarient.price;

        // CHECK IF ITEM HAS STOCK
        const stockStatus = checkStock({}, productVarient, 1)

        const userActiveCart = await getCartPriceByUserId(cartBody.userId);
        // CHECK IF USER HAVE CART AND PRODUCT HAS STOCK
        if (userActiveCart && userActiveCart.id && stockStatus.manageCart) {
            cartId = userActiveCart.id;
            var cartSubtotal = calculateCartSubtotal(userActiveCart.subTotal, 0, 0, productPrice, 1);
            // UPDATE CART PRICE
            cartBody['subTotal'] = cartSubtotal;
            cartBody['total'] = cartBody.subTotal;
            // UPDATE CART PRICE
            const updatedCartPrice = await updateCartPrice(cartBody, cartId, res);
            if (!updatedCartPrice) return true; // RETURN IF GET SOMETHING WRONG
        } else {
            // CHECK IF PRODUCT HAS STOCK
            if (stockStatus.manageCart) {
                cartBody['subTotal'] = productPrice;
                cartBody['total'] = cartBody.subTotal;
            }
            if (!userActiveCart?.id) {
                // CREATE CART
                const createdSuccess = await createNewCart(cartBody, res);
                if (!createdSuccess) return true; // RETURN IF GET SOMETHING WRONG

                cartId = createdSuccess.id;

            } else cartId = userActiveCart?.id
        }

        const cartItemBody = {
            productId: productId,
            productVarientId: productVarientId,
            cartId,
            quantity: 1,
            price: productVarient.updatedPrice || productVarient.price
        }
        //  CHECK IF PRODUCT HAS STOCK THEN ADD ITEM INTO CART 
        const cartItem = stockStatus.manageCart ? await addCartItem(cartItemBody, res) : {};
        if (!cartItem) return true; // RETURN IF GET SOMETHING WRONG
        // GET USER CART USING CART_ID
        const cart = await getCartById(cartItemBody.cartId, null, res)
        if (!cart) return true; // RETURN IF GET SOMETHING WRONG

        const reply = {
            success: stockStatus.manageCart,
            message: stockStatus.message ? stockStatus.message : queryMessage.addSuccess(sense),
            data: cart
        }
        res.send(reply);
    }
    catch (err) {
        queryMessage.sendErrorMessage(err, res)
    }
}

// "PUT" REQUEST TO UPDATE CART ITEM 
exports.update = async (req, res) => {

    try {
        const { quantity, cartItemId } = req.body;
        // GET CART ITEM FROM CART
        const cartItem = await getCartItem(cartItemId, res);
        if (!cartItem) return true; // RETURN IF GET SOMETHING WRONG
        // GET PRODUCT VARIENT AND CHECK PRODUCT AVILABLE IN STOCK OR NOT
        const productVarient = await getProductVarientById(cartItem.productId, cartItem.productVarientId, quantity, res);
        if (!productVarient) return true; // RETURN IF GET SOMETHING WRONG

        // GET CART PRICE
        const cartPrice = await exports.getCartPrice(cartItem.cartId, res);
        if (!cartPrice) return true; // RETURN IF GET SOMETHING WRONG

        const cartBody = {
            total: cartPrice.total,
            subTotal: cartPrice.subTotal
        }
        const productPrice = productVarient.updatedPrice || productVarient.price;

        const stockStatus = checkStock(cartItem, productVarient, quantity)

        if (quantity) {
            if (stockStatus.manageCart) {
                const itemBody = {
                    quantity,
                    price: productPrice
                }
                // UPDATE CART ITEM
                const updated = await updateCartItem(itemBody, cartItemId, res);
                if (!updated) return true; // RETURN IF GET SOMETHING WRONG
                // UPDATE CART PRICE
                const cartSubtotal = calculateCartSubtotal(cartPrice.subTotal, cartItem.price, cartItem.quantity, productPrice, quantity)
                cartBody.subTotal = cartSubtotal;
                cartBody.total = cartBody.subTotal;
            }
        } else {
            const deleted = await removeCartItem(cartItemId, res);
            if (!deleted) return true; // RETURN IF GET SOMETHING WRONG
            // UPDATE CART PRICE
            const cartSubtotal = calculateCartSubtotal(cartPrice.subTotal, cartItem.price, cartItem.quantity, productPrice, quantity)
            cartBody.subTotal = cartSubtotal < 0 ? 0 : cartSubtotal;
            cartBody.total = cartBody.subTotal;
        }

        // UPDATE CART PRICE
        const updatedCartPrice = await updateCartPrice(cartBody, cartItem.cartId, res);
        if (!updatedCartPrice) return true; // RETURN IF GET SOMETHING WRONG
        // GET USER CART USING CART_ID
        const cart = await getCartById(cartItem.cartId, null, res);
        if (!cart) return true; // RETURN IF GET SOMETHING WRONG

        const reply = {
            success: !stockStatus.manageCart ? false : true,
            message: stockStatus.message ? stockStatus.message : queryMessage.updateSuccess(sense),
            data: cart
        }
        res.send(reply);
    }
    catch (err) {
        queryMessage.sendErrorMessage(err, res)
    }
}

// HELPER FUNCTION TO MODIFY THE GUEST CART WITH USER CART 
exports.modifyCart = async (guestId, userId) => {
    return new Promise(async (resolve) => {
        try {

            // IF NEW USER CREATED
            if (guestId === userId) return resolve(true);

            const guestCart = await getCartById(null, guestId);
            // IF GUEST HAS NO CART THEN RETURN 
            if (!guestCart || !guestCart.cartItems.length) return resolve(true);

            const userCart = await getCartById(null, userId);

            // IF USER HAS NO CART THEN ASSIGN GUEST CART TO USER
            if (!userCart) {
                await db.cart.update({ userId }, { where: { id: guestCart.id } })
                return resolve(true);
            }

            let allItems = guestCart.cartItems.concat(userCart.cartItems),
                updatedItems = [],
                cartSubTotal = 0,
                itemIds = [];

            allItems = allItems.map((item) => {
                // GET ALL ITEMS ID SO THAT DELETE ALL ITEMS AND CREATE NEW 
                itemIds.push(item.id)
                // FIND IF ANY EXIST ITEM 
                const cartItem = updatedItems.find(x => x.productVarientId === item.productVarientId && x.productId === item.productId);
                // CALCULATE SUBTOTAL
                cartSubTotal = cartSubTotal + (item.quantity * item.productPrice);
                // CHECK IF GUEST AND USER CART HAS SAME ITEM THEN UPDATE QUENTITY
                if (cartItem) {
                    const index = updatedItems.indexOf(cartItem),
                        quentity = cartItem.quantity + item.quantity;
                    updatedItems[index].quantity = quentity > 9 ? 9 : quentity;
                } else {
                    updatedItems.push({
                        quantity: item.quantity,
                        price: item.productPrice,
                        cartId: userCart.id,
                        productVarientId: item.productVarientId,
                        productId: item.productId,
                    })
                }
                return item
            });
            // DELETE PREVIUS CART ITEMS 
            db.cartItem.destroy({ where: { id: itemIds } })
            // UPDATE CART SUBTOTAL AND TOTAL
            userCart.subTotal = cartSubTotal
            userCart.total = cartSubTotal
            // UPDATE CART
            db.cart.update(userCart, { where: { id: userCart.id } })
            db.cart.update({ status: 'assigned' }, { where: { id: guestCart.id } })
            // ADD NEW CART ITEMS
            db.cartItem.bulkCreate(updatedItems)
        }
        finally {
            resolve(true);
            return true;
        }
    })
}

// HELPER FUNCTION TO CREATE NEW CART
function createNewCart(data, res) {
    return new Promise((resolve) => {
        db.cart.create(data)
            .then(response => { resolve({ id: response.id }) })
            .catch(err => {
                const reply = {
                    success: false,
                    message: queryMessage.error(err),
                    data: {}
                }
                res.send(reply)
                resolve(null)
            })
    })
}

// HELPER FUNCTION TO ADD ITEM INTO CART
function addCartItem(data, res) {
    return new Promise((resolve) => {
        db.cartItem.create(data)
            .then(response => {
                resolve({ id: response.id })
            })
            .catch(err => {
                const reply = {
                    success: false,
                    message: queryMessage.error(err),
                    data: {}
                }
                res.send(reply)
                resolve(null)
            })
    })
}

// HELPER FUNCTION TO ADD ITEM INTO CART
exports.getCartPrice = (id, res) => {
    return new Promise(async (resolve) => {
        try {
            const price = await db.cart.findOne({
                where: { id },
                attributes: ['total', 'subTotal']
            })
            if (!price) queryMessage.sendErrorMessage(err, res)
            resolve(price);
        }
        catch (err) {
            queryMessage.sendErrorMessage(err, res)
            resolve(null);
        }
    })
}

// HELPER FUNCTION TO GET CART ITEM
function getCartItem(id, res) {
    return new Promise(async (resolve) => {
        try {
            const cartItem = await db.cartItem.findOne({
                where: { id },
                attributes: ['quantity', 'price', 'productVarientId', 'cartId', 'productId'],
                include: {
                    model: db.productVarient,
                    // as: 'varient',
                }
            })
            if (!cartItem) queryMessage.sendErrorMessage({ message: replyMessage.CART_ITEM_NOT_FOUND }, res)
            resolve(cartItem);
        }
        catch (err) {
            queryMessage.sendErrorMessage(err, res)
            resolve(null);
        }
    })
}

// HELPER FUNCTION TO UPDATE CART ITEM
function updateCartItem(body, id, res) {
    return new Promise((resolve) => {
        try {
            // UPDATE CART
            db.cartItem.update(body, {
                where: { id }
            })
                .then((response) => {
                    resolve(response)
                })
                .catch(err => {
                    const reply = {
                        success: false,
                        message: queryMessage.error(err)
                    }
                    res.send(reply);
                    resolve(null);
                })
        } catch (err) {
            const reply = {
                success: false,
                message: queryMessage.error(err),
                data: {}
            }
            res.send(reply)
            resolve(null)
        }
    })
}

// HELPER FUNCTION TO REMOVE CART ITEM
function removeCartItem(id, res) {
    return new Promise((resolve) => {
        try {
            // UPDATE CART
            db.cartItem.destroy({
                where: { id }
            })
                .then((response) => {
                    resolve(response)
                })
                .catch(err => {
                    const reply = {
                        success: false,
                        message: queryMessage.error(err)
                    }
                    res.send(reply);
                    resolve(null);
                })
        } catch (err) {
            const reply = {
                success: false,
                message: queryMessage.error(err),
                data: {}
            }
            res.send(reply)
            resolve(null)
        }
    })

}

// HELPER FUNCTION TO GET CART ( if cartId is null fetch cart with user id )
function getCartById(cartId, userId, res) {
    return new Promise(async (resolve) => {
        try {
            const cart = await db.cart.findOne({
                where: cartId ? { id: cartId } : { [Op.and]: [{ userId }, { status: 'open' }] },
                attributes: ['id', 'total', 'subTotal'],
                include: {
                    model: db.cartItem,
                    as: 'cartItems',
                    where: cartId ? { cartId } : {},
                    attributes: ['id', 'quantity', 'productVarientId', 'price'],
                    include: {
                        model: db.product,
                        attributes: ['id', 'name', 'image', 'color'],
                        include: {
                            model: db.productVarient,
                            as: 'varients',
                            attributes: ['id', 'weight', 'stock', 'isActiveStock', "updatedPrice", "price"],
                            include: {
                                model: db.weightType,
                                as: 'type',
                                attributes: ['name'],
                            }
                        }
                    }
                }
            })
            if (!cart) {
                const reply = {
                    success: false,
                    message: queryMessage.error({ message: replyMessage.EMPTY_CART }),
                    data: {}
                }
                res && res.send(reply)
                resolve(null)
                return true;
            }
            var data = cart.get(),
                cartSubTotal = 0;
            // UPDATE PRODUCT VARIENT AND TYPE RECORDS
            data.cartItems = data.cartItems.map(item => {
                item = item.get(); // GET VALUE
                var varient = item.product.varients.find(varient => varient.id === item.productVarientId);
                item['productId'] = item.product.id
                item['name'] = item.product.name
                item['image'] = item.product.image

                if (varient) {

                    // PRICE CALCULATION *** $
                    item['productPrice'] = varient.updatedPrice || varient.price;
                    item['oldPrice'] = parseFloat(item.price).toFixed(2);
                    item['priceDiff'] = parseFloat(item.oldPrice - item.productPrice).toFixed(2);
                    item['priceStatus'] = item.oldPrice === item.productPrice ? 'eql' : item.oldPrice < item.productPrice ? 'incr' : 'decr'
                    item['price'] = parseFloat(item.quantity * item.productPrice).toFixed(2);
                    // *** @

                    item['productVarientId'] = varient.id;
                    item['weight'] = varient.weight;
                    item['weightType'] = varient.type.name;
                    item['productInStock'] = varient.stock > 3 ? varient.stock : 0
                    item['isActiveStock'] = varient.isActiveStock

                    cartSubTotal += parseFloat((varient.stock < 3 && varient.isActiveStock) ? 0 : item.price)
                }

                delete item.product.varients;
                // delete item.productVarientId;
                delete item.product;
                return item;
            })
            data.subTotal = parseFloat(cartSubTotal).toFixed(2)
            data.total = data.subTotal
            resolve(data)
        } catch (err) {
            const reply = {
                success: false,
                message: queryMessage.error(err),
                data: {}
            }
            res && res.send(reply)
            resolve(null)
        }
    })
}

// HELPER FUNCTION TO GET CART BY USER_ID
function getCartPriceByUserId(userId) {
    return new Promise(async (resolve) => {
        try {
            const cart = await db.cart.findOne({
                where: { [Op.and]: [{ userId }, { status: 'open' }] },
                attributes: ['id', 'total', 'subTotal']
            })
            if (cart) resolve(cart);
            else resolve({});
        }
        catch (err) {
            resolve({})
        }
    })
}

// HELPER FUNCTION TO UPDATE CART PRICE
function updateCartPrice(body, id, res) {
    return new Promise((resolve) => {
        try {
            // UPDATE CART
            db.cart.update(body, {
                where: { id }
            })
                .then((response) => {
                    resolve(response)
                })
                .catch(err => {
                    const reply = {
                        success: false,
                        message: queryMessage.error(err)
                    }
                    res.send(reply);
                    resolve(null);
                })
        } catch (err) {
            const reply = {
                success: false,
                message: queryMessage.error(err),
                data: {}
            }
            res.send(reply)
            resolve(null)
        }
    })
}

// CALCULATE CART SUBTOTAL USING CART_SUBTOTAL, CART_ITEM_PRICE, CART_ITEM_QUANLITY, PRODUCT_VARIENT_PRICE, NEW QUANTITY
function calculateCartSubtotal(subTotal, itemPrice, itemQuantity, productVarientPrice, updatedQuantity) {
    return (subTotal - (itemPrice * itemQuantity)) + (productVarientPrice * updatedQuantity)
}

// 
function checkStock(cartItem, productVarient, newQty) {

    if (productVarient.isActiveStock) {
        if (newQty < cartItem.quantity) {
            return { manageCart: true };
        }
        else if (productVarient.stock < 3) {
            return { manageCart: false, quantity: productVarient.stock, message: `OUT of stock!` }
        }
        else if (productVarient.stock < newQty) {
            return { manageCart: false, quantity: productVarient.stock, message: `No more in stock, Only ${productVarient.stock} ${productVarient.stock === 1 ? 'item is' : 'items are'} left!` }
        }
        else return { manageCart: true }
    }
    else return { manageCart: true }
}

//
exports.getCartProduct = (cartId, res) => {
    return new Promise(async (resolve) => {
        try {
            const items = await db.cartItem.findAll({
                where: { cartId },
                attributes: ['id'],
                include: {
                    model: db.product,
                    attributes: ['id'],
                    include: {
                        model: db.productVarient,
                        as: 'varients',
                        where: { 'isActiveStock': true },
                        attributes: ['stock'],
                    }
                }
            })
            resolve(items)
        }
        catch (err) {
            resolve([])
        }
    })
}