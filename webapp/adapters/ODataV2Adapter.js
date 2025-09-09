sap.ui.define(["sap/ui/model/odata/v2/ODataModel"], function (ODataModel) {
    "use strict";

    return {
        _getODataModel: async sService => {
            const oDataModel = new ODataModel(`/odata/v2${sService}`, { useBatch: false })
            return new Promise(function (resolve, reject) {
                oDataModel.attachMetadataLoaded(_ => resolve(oDataModel));
                oDataModel.attachMetadataFailed(_ => reject(new Error("It was not possible to read the metadata")));
            });
        },

        _makeSuccessResponse: (oData, oResponse) => ({
            status: oResponse.statusCode,
            body: oData
        }),

        _makeErrorResponse: oError => ({
            error: oError || "Unexpected error"
        }),

        adaptRequest: async function ({ sService, sPath, sMethod, oBody, oOptions = {} }) {
            const oParams = oBody ? [sPath, oBody] : [sPath];
            try {
                const oConnection = await this._getODataModel(sService)
                return await new Promise((resolve, reject) => {
                    oConnection[sMethod](...oParams, {
                        ...oOptions,
                        success: (oData, oResponse) => resolve(this._makeSuccessResponse(oData, oResponse)),
                        error: oError => reject(this._makeErrorResponse(oError)),
                    })
                })
            } catch (oError) {
                return this._makeErrorResponse(oError);
            };
        },
    };
});
