const Enum = require('enum')

// exports.OrderStatusEnum = {
//     "Placed": 1,
//     "In Prepration": 2,
//     "Shipped": 3,
//     "Canceled": 4,
//     "Resheduled": 5,
//     "Delivered": 6,
//     "Assigned": 7,
//     "Ready": 8,
// }

exports.OrderStatusEnum = new Enum(
    {
        "Placed": 1,
        "In Prepration": 2,
        "Shipped": 3,
        "Canceled": 4,
        "Resheduled": 5,
        "Delivered": 6,
        "Assigned": 7,
        "Ready": 8
    }
)

exports.OrderStatusEnumValue = {
    "Placed": 1,
    "In Prepration": 2,
    "Shipped": 3,
    "Canceled": 4,
    "Resheduled": 5,
    "Delivered": 6,
    "Assigned": 7,
    "Ready": 8,
}

exports.paymentMethodEnum = {
    "Cash On Delivery": 1,
    "Online": 2,
}

exports.cartEnum = {
    "Open": 1,
    "Assigned": 2,
    "Placed": 3,
    "abandoned": 3,
}

exports.deviceTypeEnum = {
    "IOS": 1,
    "Android": 2,
    "Web": 3,
}

exports.AddressTypeEnum = {
    "Home": 1,
    "Office": 2,
    "Other": 3,
}

exports.UserRoleEnum = {
    "Admin": 1,
    "Consumer": 2,
}

exports.SupportStatusEnum = {
    "Pending": 1,
    "Viewed": 2,
    "Resovled": 3
}

exports.StoreStatusEnum = {
    "Registered": 1,
    "InReview": 2,
    "Active": 3,
    "InActive": 4,
}

exports.StoreTypeEnum = {
    "Fruit": 1,
    "Vegetable": 2,
}

exports.StorePaymentStatusEnum = {
    "Unpaid": 0,
    "Paid": 1,
}

exports.DriverOrderStatusEnum = {
    "Assigned": 1,
    "React To Pickup": 2,
    "On Way": 3,
    "Deliver": 4,
    "Cancel": 5,
}

exports.StoreOrderStatusEnum = {
    "Assigned": 7,
    "In Prepration": 2,
    "Ready": 8,
    "Canceled": 4,
    "Delivered": 6,
}