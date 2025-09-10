sap.ui.define([
  "com/lab2dev/ui/purchase/order/controller/BaseController",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "com/lab2dev/ui/purchase/order/model/models"
], (BaseController, MessageBox, MessageToast, models) => {
  "use strict";

  const _SERVICE = "/catalog";
  const _ENTITY_PATH = "/Orders";
  const _KEY_PROP = "ID";

  return BaseController.extend("com.lab2dev.ui.purchase.order.controller.Orders", {

    _makeEmptyDraft: () => ({
        CompanyCode: "",
        Supplier: "",
        Currency: "",
        NetAmount: null,
        CreatedAtS4: "",
        Status: ""
      }),

    async onInit() {
      this._setModel({ oModel: { count: 0, mode: null }, sModelName: "ui" });
      this._setModel({ oModel: this._makeEmptyDraft(), sModelName: "draft" });
      await this._load();
    },

    async _load() {
      const { body, error } = await models.read({ sService: _SERVICE, sPath: _ENTITY_PATH });
      if (error) return MessageBox.error("Failed to load Orders.");
      this._setModel({ oModel: body.results, sModelName: "orders" });
      this._setProperty({ sModelName: "ui", sProperty: "/count", oValue: body.results.length || 0 });
    },

    _selectedObject() {
      const table = this.byId("idOrdersTable");
      const context = table.getSelectedItem()?.getBindingContext("orders");
      return context ? context.getObject() : null;
    },

    _entityKeyPath(obj) {
      const id = obj?.[_KEY_PROP];
      if (id === undefined || id === null) {
        throw new Error(`Key property '${_KEY_PROP}' not found in the selected item.`);
      }
      const key = typeof id === "string" ? `'${id}'` : id;
      return `${_ENTITY_PATH}(${key})`;
    },

    _open(mode, data) {
      this._setProperty({ sModelName: "ui", sProperty: "/mode", oValue: mode });
      this._getModel("draft").setData(data || this._makeEmptyDraft());
      this.byId("orderDialog").open();
    },

    _close() {
      this._setProperty({ sModelName: "ui", sProperty: "/mode", oValue: null });
      this.byId("orderDialog").close();
    },

    onAdd() {
      this._open("create", this._makeEmptyDraft());
    },

    onEdit() {
      const obj = this._selectedObject();
      if (!obj) return MessageToast.show("Select a record to edit.");
      this._open("edit", { ...obj });
    },

    async onDelete() {
      const obj = this._selectedObject();
      if (!obj) return MessageToast.show("Select a record to delete.");
      
      MessageBox.confirm("Do you really want to delete this record?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: async (action) => {
          if (action !== MessageBox.Action.YES) return;
          const { error} = await models.remove({ sService: _SERVICE, sPath: this._entityKeyPath(obj) });
          if (error) return MessageBox.error("Error deleting record.");
          return MessageToast.show("Record deleted.")
        }
      });
    },

    async onSave() {
      const mode = this._getProperty ({ sModelName: "ui", sPath: "/mode" });
      const payload = this._getModel("draft").getData();

      if (mode === "create") {
         const { error } = await models.create({ sService: _SERVICE, sPath: _ENTITY_PATH, oBody: payload });
          if (error) return MessageBox.error("Failed to save record.");;
      } else if (mode === "edit") {
          const obj = this._selectedObject();
          if (!obj) return MessageToast.show("Select a record to edit.");
          const { error } = await models.update({ sService: _SERVICE, sPath: this._entityKeyPath(obj), oBody: payload });
          if (error) return MessageBox.error("Failed to save record.");;
      }

      this._close();
      await this._load();
      MessageToast.show("Operation successfully done!");
    },

    onCancel() {
      this._close();
    }
  });
});
