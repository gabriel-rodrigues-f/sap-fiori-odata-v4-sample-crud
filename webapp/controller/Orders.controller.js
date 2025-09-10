sap.ui.define([
  "com/lab2dev/ui/purchase/order/controller/BaseController",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "com/lab2dev/ui/purchase/order/model/models"
], (BaseController, MessageBox, MessageToast, models) => {
  "use strict";

  const SERVICE = "/catalog";
  const ENTITY_PATH = "/Orders";
  const KEY_PROP = "ID";

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
      const { body, error } = await models.read({ sService: SERVICE, sPath: ENTITY_PATH });
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
      const id = obj?.[KEY_PROP];
      if (id === undefined || id === null) {
        throw new Error(`Key property '${KEY_PROP}' not found in the selected item.`);
      }
      const key = typeof id === "string" ? `'${id}'` : id;
      return `${ENTITY_PATH}(${key})`;
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

    _extractError(e) {
      try {
        const raw = e?.responseText || e?.message || e?.body;
        if (!raw) return null;
        const j = typeof raw === "string" ? JSON.parse(raw) : raw;
        return j?.error?.message?.value || j?.error?.message || j?.message || raw;
      } catch (_) {
        return e?.message || null;
      }
    },

    onAdd() {
      this._open("create", this._makeEmptyDraft());
    },

    onEdit() {
      const obj = this._selectedObject();
      if (!obj) {
        MessageToast.show("Select a record to edit.");
        return;
      }
      this._open("edit", { ...obj });
    },

    async onDelete() {
      const obj = this._selectedObject();
      if (!obj) {
        MessageToast.show("Select a record to delete.");
        return;
      }

      MessageBox.confirm("Do you really want to delete this record?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: async (act) => {
          if (act !== MessageBox.Action.YES) return;

          try {
            await models.remove({
              sService: SERVICE,
              sPath: this._entityKeyPath(obj)
            });
            MessageToast.show("Record deleted.");
            await this._load();
          } catch (e) {
            MessageBox.error(this._extractError(e) || "Error deleting record.");
          }
        }
      });
    },

    // =============== Dialog Actions ===============
    async onSave() {
      const mode = this._getModel("ui").getProperty("/mode");
      const payload = this._getModel("draft").getData();

      try {
        if (mode === "create") {
          await models.create({
            sService: SERVICE,
            sPath: ENTITY_PATH,
            oBody: payload
          });
          MessageToast.show("Record created successfully.");
        } else if (mode === "edit") {
          const obj = this._selectedObject();
          if (!obj) {
            MessageToast.show("Select a record to edit.");
            return;
          }
          await models.update({
            sService: SERVICE,
            sPath: this._entityKeyPath(obj),
            oBody: payload
          });
          MessageToast.show("Record updated successfully.");
        }
        this._close();
        await this._load();
      } catch (e) {
        MessageBox.error(this._extractError(e) || "Failed to save record.");
      }
    },

    onCancel() {
      this._close();
    }
  });
});
