

sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "com/lab2dev/ui/purchase/order/adapters/ODataV2Adapter",
    "com/lab2dev/ui/purchase/order/model/methods",
],
    function (JSONModel, Device, ODataV2Adapter, methods) {
        "use strict";
        const { read, update, create, remove } = methods;
        return {
            /**
             * Provides runtime information for the device the UI5 app is running on as a JSONModel.
             * @returns {sap.ui.model.json.JSONModel} The device model.
             */
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            read: async function ({ sService, sPath, oOptions }) {
                return await ODataV2Adapter.adaptRequest({
                    sMethod: read,
                    sService,
                    sPath,
                    oOptions
                });
            },

            remove: async function ({ sService, sPath }) {
                return await ODataV2Adapter.adaptRequest({
                    sMethod: remove,
                    sService,
                    sPath
                });
            },

            create: async function ({ sService, sPath, oBody }) {
                return await ODataV2Adapter.adaptRequest({
                    sMethod: create,
                    sService,
                    sPath,
                    oBody
                });
            },

            update: async function ({ sService, sPath, oBody }) {
                return await ODataV2Adapter.adaptRequest({
                    sMethod: update,
                    sService,
                    sPath,
                    oBody
                });
            }
        };
    });
