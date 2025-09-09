sap.ui.define([
    "com/lab2dev/ui/purchase/order/controller/BaseController",
    "com/lab2dev/ui/purchase/order/model/models"
], (BaseController, models) => {
    "use strict";

    return BaseController.extend("com.lab2dev.ui.purchase.order.controller.Orders", {
        async onInit() {
            const { body } = await models.read({ sService: "/catalog", sPath: "/Orders", oOptions: {} });
            this._setModel({ oModel: body.results, sModelName: "orders" });
        }
    });
});
