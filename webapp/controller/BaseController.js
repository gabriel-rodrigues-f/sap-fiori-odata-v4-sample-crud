sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, JSONModel, UIComponent) {
    "use strict"

    return Controller.extend(
      "com.lab2dev.ui.purchase.order.controller.BaseController",
      {
        _getModel: function (sModelName) {
          return this.getView().getModel(sModelName);
        },

        _setModel: function ({ oModel, sModelName }) {
          return this.getView().setModel(new JSONModel(oModel), sModelName);
        },

        _getProperty: function ({ sModelName, sPath }) {
          return this.getView().getModel(sModelName).getProperty(sPath);
        },

        _setProperty: function ({ sModelName, sProperty, oValue}) {
          return this._getModel(sModelName).setProperty(sProperty, oValue);
        },

        _navigateTo({ sViewName, sId }) {
          const oRouter = UIComponent.getRouterFor(this);
          oRouter.navTo(sViewName, { id: sId });
        }
      }
    )
  }
)