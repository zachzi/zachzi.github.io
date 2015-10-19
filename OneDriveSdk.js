var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

window.__extends = __extends;

!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.OneDrive=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var ErrorType = _dereq_('./models/ErrorType');
var Constants = function () {
        function Constants() {
        }
        Constants.ERROR_ACCESS_DENIED = 'access_denied';
        Constants.ERROR_POPUP_OPEN = {
            errorCode: ErrorType.popupOpen,
            message: 'popup window is already open'
        };
        Constants.ERROR_WEB_REQUEST = {
            errorCode: ErrorType.webRequestFailure,
            message: 'web request failed, see console logs for details'
        };
        Constants.HTTP_GET = 'GET';
        Constants.HTTP_POST = 'POST';
        Constants.HTTP_PUT = 'PUT';
        Constants.LINKTYPE_WEB = 'webLink';
        Constants.LINKTYPE_DOWNLOAD = 'downloadLink';
        Constants.PARAM_ACCESS_TOKEN = 'access_token';
        Constants.PARAM_ERROR = 'error';
        Constants.PARAM_STATE = 'state';
        Constants.SDK_VERSION = 'js-v2.0';
        Constants.STATE_AAD_LOGIN = 'aad_tenant_login';
        Constants.STATE_AAD_PICKER = 'aad_picker';
        Constants.STATE_DISCOVERY = 'discovery';
        Constants.STATE_MSA_PICKER = 'msa_picker';
        Constants.TYPE_BOOLEAN = 'boolean';
        Constants.TYPE_FUNCTION = 'function';
        Constants.TYPE_OBJECT = 'object';
        Constants.TYPE_STRING = 'string';
        Constants.VROOM_URL = 'https://api.onedrive.com/v1.0/';
        return Constants;
    }();
module.exports = Constants;
},{"./models/ErrorType":6}],2:[function(_dereq_,module,exports){
var Constants = _dereq_('./Constants'), OneDriveApp = _dereq_('./OneDriveApp');
var OneDrive = function () {
        function OneDrive() {
        }
        OneDrive.open = function (options) {
            OneDriveApp.open(options);
        };
        OneDrive.save = function (options) {
            OneDriveApp.save(options);
        };
        OneDrive.webLink = Constants.LINKTYPE_WEB;
        OneDrive.downloadLink = Constants.LINKTYPE_DOWNLOAD;
        return OneDrive;
    }();
OneDriveApp.onloadInit();
module.exports = OneDrive;
},{"./Constants":1,"./OneDriveApp":3}],3:[function(_dereq_,module,exports){
var DomHelper = _dereq_('./utilities/DomHelper'), ErrorHelper = _dereq_('./utilities/ErrorHelper'), Logging = _dereq_('./utilities/Logging'), OneDriveState = _dereq_('./OneDriveState'), PickerHelper = _dereq_('./utilities/PickerHelper'), PickerMode = _dereq_('./models/PickerMode'), RedirectHelper = _dereq_('./utilities/RedirectHelper'), ResponseHelper = _dereq_('./utilities/ResponseHelper'), SaverHelper = _dereq_('./utilities/SaverHelper');
var OneDriveApp = function () {
        function OneDriveApp() {
        }
        OneDriveApp.onloadInit = function () {
            ErrorHelper.registerErrorObserver(OneDriveState.clearState);
            DomHelper.getScriptInput();
            Logging.logMessage('initialized');
            var redirectResponse = RedirectHelper.handleRedirect();
            if (!redirectResponse) {
                return;
            }
            var pickerResponse = ResponseHelper.parsePickerResponse(redirectResponse);
            var options = redirectResponse.windowState.options;
            var optionsMode = redirectResponse.windowState.optionsMode;
            switch (optionsMode) {
            case PickerMode[PickerMode.open]:
                var pickerHelper = new PickerHelper(options);
                if (pickerResponse.error) {
                    pickerHelper.handlePickerError(pickerResponse);
                } else {
                    pickerHelper.handlePickerSuccess(pickerResponse);
                }
                break;
            case PickerMode[PickerMode.save]:
                var saverHelper = new SaverHelper(options);
                if (pickerResponse.error) {
                    saverHelper.handleSaverError(pickerResponse);
                } else {
                    saverHelper.handleSaverSuccess(pickerResponse);
                }
                break;
            default:
                ErrorHelper.throwError('invalid value for options.mode: ' + optionsMode);
            }
        };
        OneDriveApp.open = function (options) {
            if (!OneDriveState.readyCheck()) {
                return;
            }
            if (!options) {
                ErrorHelper.throwError('missing picker options');
            }
            Logging.logMessage('open started');
            var pickerHelper = new PickerHelper(options);
            pickerHelper.launchPicker();
        };
        OneDriveApp.save = function (options) {
            if (!OneDriveState.readyCheck()) {
                return;
            }
            if (!options) {
                ErrorHelper.throwError('missing saver options');
            }
            Logging.logMessage('save started');
            var saverHelper = new SaverHelper(options);
            saverHelper.launchSaver();
        };
        return OneDriveApp;
    }();
module.exports = OneDriveApp;
},{"./OneDriveState":4,"./models/PickerMode":8,"./utilities/DomHelper":14,"./utilities/ErrorHelper":15,"./utilities/Logging":17,"./utilities/PickerHelper":19,"./utilities/RedirectHelper":21,"./utilities/ResponseHelper":22,"./utilities/SaverHelper":23}],4:[function(_dereq_,module,exports){
var OneDriveState = function () {
        function OneDriveState() {
        }
        OneDriveState.clearState = function () {
            window.name = '';
            OneDriveState._isSdkReady = true;
        };
        OneDriveState.readyCheck = function () {
            if (!OneDriveState.clientIds || !OneDriveState._isSdkReady) {
                return false;
            }
            OneDriveState._isSdkReady = false;
            return true;
        };
        OneDriveState._isSdkReady = true;
        return OneDriveState;
    }();
module.exports = OneDriveState;
},{}],5:[function(_dereq_,module,exports){
var ApiEndpoint;
(function (ApiEndpoint) {
    ApiEndpoint[ApiEndpoint['filesV2'] = 0] = 'filesV2';
    ApiEndpoint[ApiEndpoint['other'] = 1] = 'other';
    ApiEndpoint[ApiEndpoint['vroom'] = 2] = 'vroom';
}(ApiEndpoint || (ApiEndpoint = {})));
module.exports = ApiEndpoint;
},{}],6:[function(_dereq_,module,exports){
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType['badResponse'] = 0] = 'badResponse';
    ErrorType[ErrorType['fileReaderFailure'] = 1] = 'fileReaderFailure';
    ErrorType[ErrorType['popupOpen'] = 2] = 'popupOpen';
    ErrorType[ErrorType['unknown'] = 3] = 'unknown';
    ErrorType[ErrorType['unsupportedFeature'] = 4] = 'unsupportedFeature';
    ErrorType[ErrorType['webRequestFailure'] = 5] = 'webRequestFailure';
}(ErrorType || (ErrorType = {})));
module.exports = ErrorType;
},{}],7:[function(_dereq_,module,exports){
var CallbackHelper = _dereq_('../utilities/CallbackHelper'), Constants = _dereq_('../Constants'), Logging = _dereq_('../utilities/Logging'), StringHelper = _dereq_('../utilities/StringHelper'), TypeValidationHelper = _dereq_('../utilities/TypeValidationHelper');
var InvokerOptions = function () {
        function InvokerOptions(options) {
            this.openInNewWindow = TypeValidationHelper.validateType(options.openInNewWindow, Constants.TYPE_BOOLEAN, true, true);
            this.expectGlobalFunction = !this.openInNewWindow;
            if (this.expectGlobalFunction) {
                this.cancelName = options.cancel;
                this.errorName = options.error;
            }
            var cancelCallback = TypeValidationHelper.validateCallback(options.cancel, true, this.expectGlobalFunction);
            this.cancel = function () {
                Logging.logMessage('user cancelled operation');
                CallbackHelper.invokeAppCallback(cancelCallback, true);
            };
            var errorCallback = TypeValidationHelper.validateCallback(options.error, true, this.expectGlobalFunction);
            this.error = function (error) {
                Logging.logError(StringHelper.format('error occured - code: \'{0}\', message: \'{1}\'', error.errorCode, error.message));
                CallbackHelper.invokeAppCallback(errorCallback, true, error);
            };
        }
        return InvokerOptions;
    }();
module.exports = InvokerOptions;
},{"../Constants":1,"../utilities/CallbackHelper":13,"../utilities/Logging":17,"../utilities/StringHelper":24,"../utilities/TypeValidationHelper":25}],8:[function(_dereq_,module,exports){
var PickerMode;
(function (PickerMode) {
    PickerMode[PickerMode['open'] = 0] = 'open';
    PickerMode[PickerMode['save'] = 1] = 'save';
}(PickerMode || (PickerMode = {})));
module.exports = PickerMode;
},{}],9:[function(_dereq_,module,exports){
var CallbackHelper = _dereq_('../utilities/CallbackHelper'), Constants = _dereq_('../Constants'), InvokerOptions = _dereq_('./InvokerOptions'), Logging = _dereq_('../utilities/Logging'), PickerMode = _dereq_('./PickerMode'), TypeValidationHelper = _dereq_('../utilities/TypeValidationHelper');
var VALID_LINKTYPE_VALUES = [
        Constants.LINKTYPE_DOWNLOAD,
        Constants.LINKTYPE_WEB
    ];
var PickerOptions = function (_super) {
        __extends(PickerOptions, _super);
        function PickerOptions(options) {
            _super.call(this, options);
            if (this.expectGlobalFunction) {
                this.successName = options.success;
            }
            var successCallback = TypeValidationHelper.validateCallback(options.success, false, this.expectGlobalFunction);
            this.success = function (files) {
                Logging.logMessage('picker operation succeeded');
                CallbackHelper.invokeAppCallback(successCallback, true, files);
            };
            this.multiSelect = TypeValidationHelper.validateType(options.multiSelect, Constants.TYPE_BOOLEAN, true, false);
            this.linkType = TypeValidationHelper.validateType(options.linkType, Constants.TYPE_STRING, true, Constants.LINKTYPE_DOWNLOAD, VALID_LINKTYPE_VALUES);
            this.getWebLinks = this.linkType === Constants.LINKTYPE_WEB;
        }
        PickerOptions.prototype.serializeToWindowName = function () {
            return {
                optionsMode: PickerMode[PickerMode.open],
                options: {
                    success: this.successName,
                    cancel: this.cancelName,
                    error: this.errorName,
                    linkType: this.linkType,
                    multiSelect: this.multiSelect,
                    openInNewWindow: this.openInNewWindow
                }
            };
        };
        return PickerOptions;
    }(InvokerOptions);
module.exports = PickerOptions;
},{"../Constants":1,"../utilities/CallbackHelper":13,"../utilities/Logging":17,"../utilities/TypeValidationHelper":25,"./InvokerOptions":7,"./PickerMode":8}],10:[function(_dereq_,module,exports){
var CallbackHelper = _dereq_('../utilities/CallbackHelper'), Constants = _dereq_('../Constants'), DomHelper = _dereq_('../utilities/DomHelper'), ErrorHelper = _dereq_('../utilities/ErrorHelper'), InvokerOptions = _dereq_('./InvokerOptions'), Logging = _dereq_('../utilities/Logging'), PickerMode = _dereq_('./PickerMode'), StringHelper = _dereq_('../utilities/StringHelper'), TypeValidationHelper = _dereq_('../utilities/TypeValidationHelper'), UploadType = _dereq_('./UploadType'), UrlHelper = _dereq_('../utilities/UrlHelper');
var FORM_UPLOAD_SIZE_LIMIT = 104857600;
var FORM_UPLOAD_SIZE_LIMIT_STRING = '100 MB';
var SaverOptions = function (_super) {
        __extends(SaverOptions, _super);
        function SaverOptions(options) {
            _super.call(this, options);
            this.invalidFile = false;
            if (this.expectGlobalFunction) {
                this.successName = options.success;
                this.progressName = options.progress;
            }
            var successCallback = TypeValidationHelper.validateCallback(options.success, false, this.expectGlobalFunction);
            this.success = function () {
                Logging.logMessage('saver operation succeeded');
                CallbackHelper.invokeAppCallback(successCallback, true);
            };
            var progressCallback = TypeValidationHelper.validateCallback(options.progress, true, this.expectGlobalFunction);
            this.progress = function (percentage) {
                Logging.logMessage(StringHelper.format('upload progress: {0}%', percentage));
                CallbackHelper.invokeAppCallback(progressCallback, false, percentage);
            };
            this._setFileInfo(options);
        }
        SaverOptions.prototype.serializeToWindowName = function () {
            return {
                optionsMode: PickerMode[PickerMode.save],
                options: {
                    success: this.successName,
                    progress: this.progressName,
                    cancel: this.cancelName,
                    error: this.errorName,
                    file: this.file,
                    fileName: this.fileName,
                    openInNewWindow: this.openInNewWindow
                }
            };
        };
        SaverOptions.prototype._setFileInfo = function (options) {
            this.file = TypeValidationHelper.validateType(options.file, Constants.TYPE_STRING);
            var fileName = TypeValidationHelper.validateType(options.fileName, Constants.TYPE_STRING, true, null);
            if (UrlHelper.isPathFullUrl(this.file)) {
                this.uploadType = UploadType.url;
                this.fileName = fileName || UrlHelper.getFileNameFromUrl(this.file);
                if (!this.fileName) {
                    ErrorHelper.throwError('must supply a file name or a URL that ends with a file name');
                }
            } else if (UrlHelper.isPathDataUrl(this.file)) {
                this.uploadType = UploadType.dataUrl;
                this.fileName = fileName;
                if (!this.fileName) {
                    ErrorHelper.throwError('must supply a file name for data URL uploads');
                }
            } else {
                this.uploadType = UploadType.form;
                var fileInputElement = DomHelper.getElementById(this.file);
                if (fileInputElement instanceof HTMLInputElement) {
                    if (fileInputElement.type !== 'file') {
                        ErrorHelper.throwError('input elemenet must be of type \'file\'');
                    }
                    if (!fileInputElement.value) {
                        this.error({
                            errorCode: 0,
                            message: 'user has not supplied a file to upload'
                        });
                        this.invalidFile = true;
                        return;
                    }
                    var files = fileInputElement.files;
                    if (!files || !window['FileReader']) {
                        ErrorHelper.throwError('browser does not support Files API');
                    }
                    if (files.length !== 1) {
                        ErrorHelper.throwError('can not upload more than one file at a time');
                    }
                    var fileInput = files[0];
                    if (!fileInput) {
                        ErrorHelper.throwError('missing file input');
                    }
                    if (fileInput.size > FORM_UPLOAD_SIZE_LIMIT) {
                        this.error({
                            errorCode: 1,
                            message: 'the user has selected a file larger than ' + FORM_UPLOAD_SIZE_LIMIT_STRING
                        });
                        this.invalidFile = true;
                        return;
                    }
                    this.fileName = fileName || fileInput.name;
                    this.fileInput = fileInput;
                } else {
                    ErrorHelper.throwError('element was not an instance of an HTMLInputElement');
                }
            }
        };
        return SaverOptions;
    }(InvokerOptions);
module.exports = SaverOptions;
},{"../Constants":1,"../utilities/CallbackHelper":13,"../utilities/DomHelper":14,"../utilities/ErrorHelper":15,"../utilities/Logging":17,"../utilities/StringHelper":24,"../utilities/TypeValidationHelper":25,"../utilities/UrlHelper":26,"./InvokerOptions":7,"./PickerMode":8,"./UploadType":11}],11:[function(_dereq_,module,exports){
var UploadType;
(function (UploadType) {
    UploadType[UploadType['dataUrl'] = 0] = 'dataUrl';
    UploadType[UploadType['form'] = 1] = 'form';
    UploadType[UploadType['url'] = 2] = 'url';
}(UploadType || (UploadType = {})));
module.exports = UploadType;
},{}],12:[function(_dereq_,module,exports){
var Logging = _dereq_('./Logging'), OneDriveState = _dereq_('../OneDriveState'), UrlHelper = _dereq_('./UrlHelper');
var ACCOUNT_CHOOSER_URL = 'https://onedrive.live.com/picker/accountchooser';
var AccountChooserHelper = function () {
        function AccountChooserHelper() {
        }
        AccountChooserHelper.buildAccountChooserUrlForPicker = function (options) {
            return AccountChooserHelper._buildAccountChooserUrl('read', options.multiSelect ? 'multi' : 'single', 'file', options.linkType);
        };
        AccountChooserHelper.buildAccountChooserUrlForSaver = function () {
            return AccountChooserHelper._buildAccountChooserUrl('readwrite', 'single', 'folder');
        };
        AccountChooserHelper._buildAccountChooserUrl = function (access, selectionMode, viewType, linkType) {
            var queryParameters = {};
            var aadClientId = OneDriveState.clientIds.aadClientId;
            if (aadClientId) {
                queryParameters['aad_client_id'] = aadClientId;
            }
            var msaClientId = OneDriveState.clientIds.msaClientId;
            if (msaClientId) {
                queryParameters['msa_client_id'] = msaClientId;
            }
            if (linkType) {
                queryParameters['link_type'] = linkType;
            }
            queryParameters['ru'] = UrlHelper.trimUrlQuery(window.location.href);
            queryParameters['access'] = access;
            queryParameters['selection_mode'] = selectionMode;
            queryParameters['view_type'] = viewType;
            var fullUrl = UrlHelper.appendQueryStrings(ACCOUNT_CHOOSER_URL, queryParameters);
            Logging.logMessage('invoking account chooser: ' + fullUrl);
            return fullUrl;
        };
        return AccountChooserHelper;
    }();
module.exports = AccountChooserHelper;
},{"../OneDriveState":4,"./Logging":17,"./UrlHelper":26}],13:[function(_dereq_,module,exports){
var Constants = _dereq_('../Constants'), OneDriveState = _dereq_('../OneDriveState');
var CallbackHelper = function () {
        function CallbackHelper() {
        }
        CallbackHelper.invokeAppCallback = function (callback, isFinalCallback) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (isFinalCallback) {
                OneDriveState.clearState();
            }
            if (typeof callback === Constants.TYPE_FUNCTION) {
                callback.apply(null, args);
            }
        };
        CallbackHelper.invokeCallbackAsynchronous = function (callback) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            window.setTimeout(function () {
                callback.apply(null, args);
            }, 0);
        };
        return CallbackHelper;
    }();
module.exports = CallbackHelper;
},{"../Constants":1,"../OneDriveState":4}],14:[function(_dereq_,module,exports){
var ErrorHelper = _dereq_('./ErrorHelper'), Logging = _dereq_('./Logging'), OneDriveState = _dereq_('../OneDriveState'), StringHelper = _dereq_('./StringHelper');
var DOM_CLIENT_ID = 'client-id';
var DOM_LOGGING_ID = 'enable-logging';
var DOM_SDK_ID = 'onedrive-js';
var MSA_APPID_PATTERN = new RegExp('^([a-fA-F0-9]){16}$');
var AAD_APPID_PATTERN = new RegExp('^[a-fA-F\\d]{8}-([a-fA-F\\d]{4}-){3}[a-fA-F\\d]{12}$');
var DomHelper = function () {
        function DomHelper() {
        }
        DomHelper.getScriptInput = function () {
            var element = DomHelper.getElementById(DOM_SDK_ID);
            if (element) {
                var enableLogging = element.getAttribute(DOM_LOGGING_ID);
                if (enableLogging === 'true') {
                    Logging.loggingEnabled = true;
                }
                var rawClientIds = element.getAttribute(DOM_CLIENT_ID);
                if (!rawClientIds) {
                    ErrorHelper.throwError(StringHelper.format('SDK script tag missing \'{0}\' attribute', DOM_CLIENT_ID));
                }
                var splitClientIds = rawClientIds.split(',').map(function (str) {
                        return str.trim();
                    });
                if (splitClientIds.length < 1 || splitClientIds.length > 2) {
                    ErrorHelper.throwError('expected 1 or 2 client ids');
                }
                var clientIds = {};
                for (var i = 0; i < splitClientIds.length; i++) {
                    var clientId = splitClientIds[i];
                    if (MSA_APPID_PATTERN.test(clientId)) {
                        Logging.logMessage('parsed MSA client id: ' + clientId);
                        clientIds.msaClientId = clientId;
                    } else if (AAD_APPID_PATTERN.test(clientId)) {
                        Logging.logMessage('parsed AAD client id: ' + clientId);
                        clientIds.aadClientId = clientId;
                    } else {
                        ErrorHelper.throwError(StringHelper.format('invalid format for client id \'{0}\' - MSA: 16 characters (HEX), AAD: 32 characters (HEX) GUID', clientId));
                    }
                }
                OneDriveState.clientIds = clientIds;
            } else {
                ErrorHelper.throwError(StringHelper.format('SDK script tag missing \'{0} id', DOM_SDK_ID));
            }
        };
        DomHelper.getElementById = function (id) {
            return document.getElementById(id);
        };
        DomHelper.onDocumentReady = function (callback) {
            if (document.readyState === 'interactive' || document.readyState === 'complete') {
                callback();
            } else {
                document.addEventListener('DOMContentLoaded', callback, false);
            }
        };
        return DomHelper;
    }();
module.exports = DomHelper;
},{"../OneDriveState":4,"./ErrorHelper":15,"./Logging":17,"./StringHelper":24}],15:[function(_dereq_,module,exports){
var Logging = _dereq_('./Logging');
var ERROR_PREFIX = '[OneDriveSDK Error] ';
var ErrorHelper = function () {
        function ErrorHelper() {
        }
        ErrorHelper.registerErrorObserver = function (callback) {
            ErrorHelper._errorObservers.push(callback);
        };
        ErrorHelper.throwError = function (message) {
            var callbacks = ErrorHelper._errorObservers;
            for (var index in callbacks) {
                try {
                    callbacks[index]();
                } catch (error) {
                    Logging.logError('exception thrown invoking error observer', error);
                }
            }
            throw new Error(ERROR_PREFIX + message);
        };
        ErrorHelper._errorObservers = [];
        return ErrorHelper;
    }();
module.exports = ErrorHelper;
},{"./Logging":17}],16:[function(_dereq_,module,exports){
var Constants = _dereq_('../Constants'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), OneDriveState = _dereq_('../OneDriveState'), StringHelper = _dereq_('./StringHelper'), UrlHelper = _dereq_('./UrlHelper'), XHR = _dereq_('./XHR');
var BATCH_SIZE = 10;
var FilesV2Helper = function () {
        function FilesV2Helper() {
        }
        FilesV2Helper.callFilesV2Open = function (response, success, error) {
            var apiEndpointUrl = response.apiEndpointUrl;
            var apiEndpoint = response.apiEndpoint;
            var accessToken = response.accessToken;
            var clientId = OneDriveState.clientIds.aadClientId;
            var itemIds = response.itemIds;
            var queryParameters = {};
            queryParameters['expand'] = 'thumbnails';
            queryParameters['select'] = 'id,name,size';
            var requestHeaders = {};
            requestHeaders['Authorization'] = 'bearer ' + accessToken;
            var successObjects = [];
            var errorCount = 0;
            var totalResponses = 0;
            var numItems = itemIds.length;
            var invokeCallbacks;
            var runBatch = function (batchStart, batchEnd) {
                Logging.logMessage(StringHelper.format('running batch for items \'{0}\' - \'{1}\'', batchStart + 1, batchEnd + 1));
                for (var i = batchStart; i < batchEnd; i++) {
                    var itemId = itemIds[i];
                    var url = UrlHelper.appendToPath(apiEndpointUrl, 'drive/items/' + itemId);
                    var xhr = new XHR({
                            url: UrlHelper.appendQueryStrings(url, queryParameters),
                            clientId: clientId,
                            method: Constants.HTTP_GET,
                            apiEndpoint: apiEndpoint,
                            headers: requestHeaders
                        });
                    Logging.logMessage('performing GET on item with id: ' + itemId);
                    xhr.start(function (xhr, statusCode) {
                        successObjects.push(ObjectHelper.deserializeJSON(xhr.responseText));
                        invokeCallbacks();
                    }, function (xhr, statusCode, timeout) {
                        errorCount++;
                        invokeCallbacks();
                    });
                }
            };
            invokeCallbacks = function () {
                if (++totalResponses === numItems) {
                    if (successObjects.length) {
                        Logging.logMessage(StringHelper.format('GET metadata succeeded for \'{0}\' items', successObjects.length));
                        success(successObjects);
                    }
                    if (errorCount) {
                        Logging.logMessage(StringHelper.format('GET metadata failed for \'{0}\' items', errorCount));
                        error(errorCount);
                    }
                } else if (totalResponses % BATCH_SIZE === 0) {
                    runBatch(totalResponses, Math.min(numItems, totalResponses + BATCH_SIZE));
                }
            };
            runBatch(0, Math.min(numItems, BATCH_SIZE));
        };
        return FilesV2Helper;
    }();
module.exports = FilesV2Helper;
},{"../Constants":1,"../OneDriveState":4,"./Logging":17,"./ObjectHelper":18,"./StringHelper":24,"./UrlHelper":26,"./XHR":29}],17:[function(_dereq_,module,exports){
var ENABLE_LOGGING = 'enable_onedrive_picker_logging';
var LOG_PREFIX = '[OneDriveSDK] ';
var Logging = function () {
        function Logging() {
        }
        Logging.logError = function (message) {
            var objects = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                objects[_i - 1] = arguments[_i];
            }
            Logging._log(message, true, objects);
        };
        Logging.logMessage = function (message) {
            Logging._log(message, false);
        };
        Logging._log = function (message, isError) {
            var objects = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                objects[_i - 2] = arguments[_i];
            }
            if (isError || Logging.loggingEnabled || window[ENABLE_LOGGING]) {
                console.log(LOG_PREFIX + message, objects);
            }
        };
        Logging.loggingEnabled = false;
        return Logging;
    }();
module.exports = Logging;
},{}],18:[function(_dereq_,module,exports){
var Constants = _dereq_('../Constants'), Logging = _dereq_('./Logging');
var ObjectHelper = function () {
        function ObjectHelper() {
        }
        ObjectHelper.shallowClone = function (object) {
            if (typeof object !== Constants.TYPE_OBJECT || !object) {
                return null;
            }
            var clonedObject = {};
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    clonedObject[key] = object[key];
                }
            }
            return clonedObject;
        };
        ObjectHelper.deserializeJSON = function (text) {
            var deserializedObject = null;
            try {
                deserializedObject = JSON.parse(text);
            } catch (error) {
                Logging.logError('deserialization error' + error);
            }
            if (typeof deserializedObject !== Constants.TYPE_OBJECT || deserializedObject === null) {
                deserializedObject = {};
            }
            return deserializedObject;
        };
        ObjectHelper.serializeJSON = function (value) {
            return JSON.stringify(value);
        };
        return ObjectHelper;
    }();
module.exports = ObjectHelper;
},{"../Constants":1,"./Logging":17}],19:[function(_dereq_,module,exports){
var AccountChooserHelper = _dereq_('./AccountChooserHelper'), Constants = _dereq_('../Constants'), ErrorHelper = _dereq_('./ErrorHelper'), ErrorType = _dereq_('../models/ErrorType'), FilesV2Helper = _dereq_('./FilesV2Helper'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), Popup = _dereq_('./Popup'), PickerOptions = _dereq_('../models/PickerOptions'), RedirectHelper = _dereq_('./RedirectHelper'), StringHelper = _dereq_('./StringHelper'), VroomHelper = _dereq_('./VroomHelper');
var VROOM_THUMBNAIL_SIZES = [
        'large',
        'medium',
        'small'
    ];
var PickerHelper = function () {
        function PickerHelper(options) {
            var clonedOptions = ObjectHelper.shallowClone(options);
            this._pickerOptions = new PickerOptions(clonedOptions);
        }
        PickerHelper.prototype.launchPicker = function () {
            var _this = this;
            var pickerOptions = this._pickerOptions;
            var url = AccountChooserHelper.buildAccountChooserUrlForPicker(pickerOptions);
            var windowState = pickerOptions.serializeToWindowName();
            if (pickerOptions.openInNewWindow) {
                var popup = new Popup(url, ObjectHelper.serializeJSON(windowState), function (response) {
                        _this.handlePickerSuccess(response);
                    }, function (response) {
                        _this.handlePickerError(response);
                    });
                if (!popup.openPopup()) {
                    pickerOptions.error(Constants.ERROR_POPUP_OPEN);
                }
            } else {
                RedirectHelper.redirect(url, windowState);
            }
        };
        PickerHelper.prototype.handlePickerSuccess = function (pickerResponse) {
            var pickerType = pickerResponse.pickerType;
            switch (pickerType) {
            case Constants.STATE_MSA_PICKER:
                this._handleMSAOpenResponse(pickerResponse);
                break;
            case Constants.STATE_AAD_PICKER:
                this._handleAADOpenResponse(pickerResponse);
                break;
            default:
                ErrorHelper.throwError('invalid value for picker type: ' + pickerType);
            }
        };
        PickerHelper.prototype.handlePickerError = function (errorResponse) {
            if (errorResponse.error === Constants.ERROR_ACCESS_DENIED) {
                this._pickerOptions.cancel();
            } else {
                this._pickerOptions.error({
                    errorCode: ErrorType.unknown,
                    message: 'something went wrong: ' + errorResponse.error
                });
            }
        };
        PickerHelper.prototype._handleMSAOpenResponse = function (pickerResponse) {
            var _this = this;
            var options = this._pickerOptions;
            VroomHelper.callVroomOpen(pickerResponse, options.getWebLinks, function (apiResponse) {
                _this._handleSuccessResponse({
                    webUrl: apiResponse.webUrl,
                    files: options.getWebLinks ? apiResponse.children && apiResponse.children.length > 0 ? apiResponse.children : [apiResponse] : apiResponse.value
                });
            }, function () {
                options.error(Constants.ERROR_WEB_REQUEST);
            });
        };
        PickerHelper.prototype._handleAADOpenResponse = function (pickerResponse) {
            var _this = this;
            var options = this._pickerOptions;
            if (options.getWebLinks) {
                options.error({
                    errorCode: ErrorType.unsupportedFeature,
                    message: 'web link not supported for AAD'
                });
                return;
            }
            FilesV2Helper.callFilesV2Open(pickerResponse, function (apiResponse) {
                _this._handleSuccessResponse({
                    webUrl: null,
                    files: apiResponse
                });
            }, function (errorCount) {
                options.error({
                    errorCode: ErrorType.webRequestFailure,
                    message: StringHelper.format('\'{0}\' web request(s) failed, see console log for details', errorCount)
                });
            });
        };
        PickerHelper.prototype._handleSuccessResponse = function (response) {
            var options = this._pickerOptions;
            var files = {
                    link: options.getWebLinks ? response.webUrl : null,
                    values: []
                };
            var pickerFiles = response.files;
            if (!pickerFiles || !pickerFiles.length) {
                options.error({
                    errorCode: ErrorType.badResponse,
                    message: 'no files returned'
                });
            }
            Logging.logMessage(StringHelper.format('returning \'{0}\' files picked', pickerFiles.length));
            for (var i = 0; i < pickerFiles.length; i++) {
                var file = pickerFiles[i];
                var thumbnails = [];
                var fileLink = options.getWebLinks ? file.webUrl : file['@content.downloadUrl'];
                var fileThumbnails = file.thumbnails && file.thumbnails[0];
                if (fileThumbnails) {
                    for (var j = 0; j < VROOM_THUMBNAIL_SIZES.length; j++) {
                        thumbnails.push(fileThumbnails[VROOM_THUMBNAIL_SIZES[j]].url);
                    }
                }
                files.values.push({
                    fileName: file.name,
                    link: fileLink,
                    linkType: options.linkType,
                    size: file.size,
                    thumbnails: thumbnails
                });
            }
            options.success(files);
        };
        return PickerHelper;
    }();
module.exports = PickerHelper;
},{"../Constants":1,"../models/ErrorType":6,"../models/PickerOptions":9,"./AccountChooserHelper":12,"./ErrorHelper":15,"./FilesV2Helper":16,"./Logging":17,"./ObjectHelper":18,"./Popup":20,"./RedirectHelper":21,"./StringHelper":24,"./VroomHelper":27}],20:[function(_dereq_,module,exports){
var CallbackHelper = _dereq_('./CallbackHelper'), Constants = _dereq_('../Constants'), Logging = _dereq_('./Logging'), ResponseHelper = _dereq_('./ResponseHelper');
var POPUP_WIDTH = 800;
var POPUP_HEIGHT = 650;
var POPUP_PINGER_INTERVAL = 500;
var Popup = function () {
        function Popup(url, name, successCallback, errorCallabck) {
            this._messageCallbackInvoked = false;
            this._name = name;
            this._url = url;
            this._successCallback = successCallback;
            this._failureCallback = errorCallabck;
            Popup._createMessageReceiver();
        }
        Popup.canReceiveMessage = function (event) {
            return event.origin === window.location.origin;
        };
        Popup._createMessageReceiver = function () {
            if (!Popup._createdMessageReceiver) {
                window.addEventListener('message', function (event) {
                    if (!Popup.canReceiveMessage(event)) {
                        return;
                    }
                    var currentPopup = Popup._currentPopup;
                    if (currentPopup && currentPopup._isPopupOpen()) {
                        Popup._currentPopup = null;
                        var response = ResponseHelper.parsePickerResponse(event.data);
                        currentPopup._messageCallbackInvoked = true;
                        if (response.error === undefined) {
                            CallbackHelper.invokeCallbackAsynchronous(currentPopup._successCallback, response);
                        } else {
                            CallbackHelper.invokeCallbackAsynchronous(currentPopup._failureCallback, response);
                        }
                    }
                });
                Popup._createdMessageReceiver = true;
            }
        };
        Popup._createPopupFeatures = function () {
            var left = window.screenX + Math.max(window.outerWidth - POPUP_WIDTH, 0) / 2;
            var top = window.screenY + Math.max(window.outerHeight - POPUP_HEIGHT, 0) / 2;
            var features = [
                    'width=' + POPUP_WIDTH,
                    'height=' + POPUP_HEIGHT,
                    'top=' + top,
                    'left=' + left,
                    'status=no',
                    'resizable=yes',
                    'toolbar=no',
                    'menubar=no',
                    'scrollbars=yes'
                ];
            return features.join(',');
        };
        Popup.prototype.openPopup = function () {
            if (Popup._currentPopup) {
                return false;
            }
            this._popup = window.open(this._url, this._name, Popup._createPopupFeatures());
            this._popup.focus();
            this._createPopupPinger();
            Popup._currentPopup = this;
            return true;
        };
        Popup.prototype._createPopupPinger = function () {
            var _this = this;
            var interval = window.setInterval(function () {
                    if (_this._isPopupOpen()) {
                        _this._popup.postMessage('ping', '*');
                    } else {
                        window.clearInterval(interval);
                        Popup._currentPopup = null;
                        if (!_this._messageCallbackInvoked) {
                            Logging.logMessage('closed callback');
                            _this._failureCallback({ error: Constants.ERROR_ACCESS_DENIED });
                        }
                    }
                }, POPUP_PINGER_INTERVAL);
        };
        Popup.prototype._isPopupOpen = function () {
            return this._popup !== null && !this._popup.closed;
        };
        Popup._createdMessageReceiver = false;
        return Popup;
    }();
module.exports = Popup;
},{"../Constants":1,"./CallbackHelper":13,"./Logging":17,"./ResponseHelper":22}],21:[function(_dereq_,module,exports){
var CallbackHelper = _dereq_('./CallbackHelper'), Constants = _dereq_('../Constants'), DomHelper = _dereq_('./DomHelper'), ErrorHelper = _dereq_('./ErrorHelper'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), OneDriveState = _dereq_('../OneDriveState'), Popup = _dereq_('./Popup'), StringHelper = _dereq_('./StringHelper'), TypeValidationHelper = _dereq_('./TypeValidationHelper'), UrlHelper = _dereq_('./UrlHelper'), WindowStateHelper = _dereq_('./WindowStateHelper'), XHR = _dereq_('./XHR');
var AAD_LOGIN_URL = 'https://login.microsoftonline.com/common/oauth2/authorize';
var DISCOVERY_URL = 'https://onedrive.live.com/picker/businessurldiscovery';
var RESPONSE_TIMEOUT = 2000;
var RedirectHelper = function () {
        function RedirectHelper() {
        }
        RedirectHelper.redirect = function (url, values, windowState) {
            if (values === void 0) {
                values = null;
            }
            if (windowState === void 0) {
                windowState = null;
            }
            if (values) {
                WindowStateHelper.setWindowState(values, windowState);
            }
            window.location.replace(url);
        };
        RedirectHelper.handleRedirect = function () {
            var queryParameters = UrlHelper.readCurrentUrlParameters();
            var serializedState = WindowStateHelper.getWindowState();
            var state = queryParameters[Constants.PARAM_STATE] || serializedState[Constants.PARAM_STATE];
            if (!state && queryParameters[Constants.PARAM_ERROR] === Constants.ERROR_ACCESS_DENIED) {
                queryParameters[Constants.PARAM_STATE] = Constants.STATE_MSA_PICKER;
            } else if (state === Constants.STATE_AAD_PICKER) {
                queryParameters[Constants.PARAM_STATE] = Constants.STATE_AAD_PICKER;
            }
            var redirectState = queryParameters[Constants.PARAM_STATE];
            if (!redirectState) {
                return null;
            }
            Logging.logMessage('current state: ' + redirectState);
            var options = serializedState['options'];
            if (!options) {
                ErrorHelper.throwError('missing options from serialized state');
            }
            var inPopupFlow = TypeValidationHelper.validateType(options.openInNewWindow, Constants.TYPE_BOOLEAN);
            if (inPopupFlow) {
                RedirectHelper._displayOverlay();
            }
            switch (redirectState) {
            case Constants.STATE_DISCOVERY:
                RedirectHelper._handleDiscoverRedirect(queryParameters, inPopupFlow);
                break;
            case Constants.STATE_AAD_LOGIN:
                RedirectHelper._handleAADTenantLoginRedirect(queryParameters, inPopupFlow);
                break;
            case Constants.STATE_MSA_PICKER:
            case Constants.STATE_AAD_PICKER:
                var pickerResponse = {
                        windowState: serializedState,
                        queryParameters: queryParameters
                    };
                Logging.logMessage('sending invoker response');
                if (inPopupFlow) {
                    RedirectHelper._sendResponse(pickerResponse);
                } else {
                    return pickerResponse;
                }
                break;
            default:
                ErrorHelper.throwError('invalid value for redirect state: ' + redirectState);
            }
            return null;
        };
        RedirectHelper._handleDiscoverRedirect = function (queryParameters, inPopupFlow) {
            if (!inPopupFlow) {
                RedirectHelper._displayOverlay();
            }
            var accessToken = queryParameters[Constants.PARAM_ACCESS_TOKEN];
            if (!accessToken) {
                RedirectHelper._handleError('missing access token', inPopupFlow);
            }
            var xhr = new XHR({
                    url: UrlHelper.appendQueryString(DISCOVERY_URL, Constants.PARAM_ACCESS_TOKEN, accessToken),
                    method: Constants.HTTP_GET
                });
            xhr.start(function (xhr, statusCode) {
                var response = ObjectHelper.deserializeJSON(xhr.responseText);
                var responseValues = response.value[1];
                var tenantUrl = responseValues['serviceResourceId'];
                var apiEndpoint = responseValues['serviceEndpointUri'];
                var queryParameters = {
                        client_id: OneDriveState.clientIds.aadClientId,
                        resource: tenantUrl,
                        response_type: 'token',
                        redirect_uri: UrlHelper.trimUrlQuery(window.location.href),
                        state: Constants.STATE_AAD_LOGIN
                    };
                var stateValue = {
                        discovery: {
                            tenantUrl: tenantUrl,
                            apiEndpoint: apiEndpoint
                        }
                    };
                RedirectHelper.redirect(UrlHelper.appendQueryStrings(AAD_LOGIN_URL, queryParameters), stateValue);
            }, function (xhr, statusCode, timeout) {
                RedirectHelper._handleError(StringHelper.format('discovery request failed, status code: \'{0}\', response text: \'{1}\'', XHR.statusCodeToString(statusCode), xhr.responseText), inPopupFlow);
            });
        };
        RedirectHelper._handleAADTenantLoginRedirect = function (queryParameters, inPopupFlow) {
            if (!inPopupFlow) {
                RedirectHelper._displayOverlay();
            }
            var accessToken = queryParameters[Constants.PARAM_ACCESS_TOKEN];
            if (!accessToken) {
                RedirectHelper._handleError('missing api access token', inPopupFlow);
            }
            var stateValues = {
                    aadAccessToken: accessToken,
                    state: Constants.STATE_AAD_PICKER
                };
            var windowState = WindowStateHelper.getWindowState();
            var tenantUrl = windowState.discovery.tenantUrl;
            if (!tenantUrl) {
                RedirectHelper._handleError('missing tenant url', inPopupFlow);
            }
            RedirectHelper.redirect(UrlHelper.appendToPath(tenantUrl, 'MySiteRedirect.aspx?MySiteRedirect=AllDocuments#p=2'), stateValues, windowState);
        };
        RedirectHelper._sendResponse = function (response) {
            var pingTimeout = window.setTimeout(window.close, RESPONSE_TIMEOUT);
            window.addEventListener('message', function (event) {
                if (!Popup.canReceiveMessage(event)) {
                    return;
                }
                window.clearTimeout(pingTimeout);
                event.source.postMessage(response, window.location.origin);
                CallbackHelper.invokeCallbackAsynchronous(window.close);
            });
        };
        RedirectHelper._handleError = function (error, inPopupFlow) {
            var errorQueryParametere = {};
            errorQueryParametere[Constants.PARAM_ERROR] = error;
            if (inPopupFlow) {
                RedirectHelper._sendResponse({ queryParameters: errorQueryParametere });
            } else {
                Logging.logMessage('error in picker flow, redirecting back to app');
                errorQueryParametere[Constants.PARAM_STATE] = Constants.STATE_AAD_PICKER;
                var redirectUrl = UrlHelper.trimUrlQuery(window.location.href);
                RedirectHelper.redirect(UrlHelper.appendQueryStrings(redirectUrl, errorQueryParametere));
            }
        };
        RedirectHelper._displayOverlay = function () {
            var overlay = document.createElement('div');
            var overlayStyle = [
                    'position: fixed',
                    'width: 100%',
                    'height: 100%',
                    'top: 0px',
                    'left: 0px',
                    'background-color: white',
                    'opacity: 1',
                    'z-index: 10000'
                ];
            overlay.id = 'od-overlay';
            overlay.style.cssText = overlayStyle.join(';');
            var spinner = document.createElement('img');
            var spinnerStyle = [
                    'position: absolute',
                    'top: calc(50% - 40px)',
                    'left: calc(50% - 40px)'
                ];
            spinner.id = 'od-spinner';
            spinner.src = 'https://p.sfx.ms/common/spinner_grey_40_transparent.gif';
            spinner.style.cssText = spinnerStyle.join(';');
            overlay.appendChild(spinner);
            var hiddenStyle = document.createElement('style');
            hiddenStyle.type = 'text/css';
            hiddenStyle.innerHTML = 'body { visibility: hidden !important; }';
            document.head.appendChild(hiddenStyle);
            DomHelper.onDocumentReady(function () {
                var documentBody = document.body;
                if (documentBody !== null) {
                    documentBody.insertBefore(overlay, documentBody.firstChild);
                } else {
                    document.createElement('body').appendChild(overlay);
                }
                document.head.removeChild(hiddenStyle);
            });
        };
        return RedirectHelper;
    }();
module.exports = RedirectHelper;
},{"../Constants":1,"../OneDriveState":4,"./CallbackHelper":13,"./DomHelper":14,"./ErrorHelper":15,"./Logging":17,"./ObjectHelper":18,"./Popup":20,"./StringHelper":24,"./TypeValidationHelper":25,"./UrlHelper":26,"./WindowStateHelper":28,"./XHR":29}],22:[function(_dereq_,module,exports){
var ApiEndpoint = _dereq_('../models/ApiEndpoint'), Constants = _dereq_('../Constants'), ErrorHelper = _dereq_('./ErrorHelper'), Logging = _dereq_('./Logging');
var CID_PADDING = '0000000000000000';
var CID_PADDING_LENGTH = CID_PADDING.length;
var MSA_SCOPE_RESPONSE_PATTERN = new RegExp('^\\w+\\.\\w+:\\w+[\\|\\w+]+:([\\w]+\\!\\d+)(?:\\!(.+))*$');
var ResponseHelper = function () {
        function ResponseHelper() {
        }
        ResponseHelper.parsePickerResponse = function (response) {
            Logging.logMessage('parsing picker response');
            var serializedState = response.windowState;
            if (!serializedState) {
                ErrorHelper.throwError('missing windowState from picker response');
            }
            var queryParameters = response.queryParameters;
            if (!queryParameters) {
                ErrorHelper.throwError('missing queryParameters from picker response');
            }
            var responseError = queryParameters[Constants.PARAM_ERROR];
            if (responseError) {
                return { error: responseError };
            }
            var pickerType = queryParameters[Constants.PARAM_STATE];
            var result = { pickerType: pickerType };
            switch (pickerType) {
            case Constants.STATE_MSA_PICKER:
                result.apiEndpoint = ApiEndpoint.vroom;
                ResponseHelper._parseMSAResponse(result, queryParameters);
                break;
            case Constants.STATE_AAD_PICKER:
                result.apiEndpoint = ApiEndpoint.filesV2;
                ResponseHelper._parseAADResponse(result, queryParameters, serializedState);
                break;
            default:
                ErrorHelper.throwError('invalid value for picker type: ' + pickerType);
            }
            if (!result.accessToken) {
                ErrorHelper.throwError('missing access token');
            }
            if (!result.apiEndpointUrl) {
                ErrorHelper.throwError('missing API endpoint URL');
            }
            return result;
        };
        ResponseHelper._parseMSAResponse = function (result, queryParameters) {
            result.accessToken = queryParameters[Constants.PARAM_ACCESS_TOKEN];
            result.apiEndpointUrl = Constants.VROOM_URL;
            var responseScope = queryParameters['scope'];
            if (!responseScope) {
                ErrorHelper.throwError('missing \'scope\' paramter from MSA picker response');
            }
            var scopeResult = MSA_SCOPE_RESPONSE_PATTERN.exec(responseScope);
            if (!scopeResult) {
                ErrorHelper.throwError('scope was not formatted correctly');
            }
            var rawResult = scopeResult[1].split('_');
            var rawItemId = rawResult[1];
            var splitIndex = rawItemId.indexOf('!');
            var rawItemIdPart1 = rawItemId.substring(0, splitIndex);
            var rawItemIdPart2 = rawItemId.substring(splitIndex);
            var ownerCid = ResponseHelper._leftPadCid(rawItemIdPart1);
            var itemId = ownerCid + rawItemIdPart2;
            result.ownerCid = ownerCid;
            result.itemId = itemId;
            result.authKey = result[2];
        };
        ResponseHelper._parseAADResponse = function (result, queryParameters, state) {
            result.accessToken = state.aadAccessToken;
            result.apiEndpointUrl = state.discovery && state.discovery.apiEndpoint;
            var itemIds = queryParameters['item-id'].split(',');
            if (!itemIds.length) {
                ErrorHelper.throwError('missing item id(s)');
            }
            result.itemIds = itemIds;
        };
        ResponseHelper._leftPadCid = function (cid) {
            if (cid.length === CID_PADDING_LENGTH) {
                return cid;
            }
            return CID_PADDING.substring(0, CID_PADDING_LENGTH - cid.length) + cid;
        };
        return ResponseHelper;
    }();
module.exports = ResponseHelper;
},{"../Constants":1,"../models/ApiEndpoint":5,"./ErrorHelper":15,"./Logging":17}],23:[function(_dereq_,module,exports){
var AccountChooserHelper = _dereq_('./AccountChooserHelper'), CallbackHelper = _dereq_('./CallbackHelper'), Constants = _dereq_('../Constants'), ErrorHelper = _dereq_('./ErrorHelper'), ErrorType = _dereq_('../models/ErrorType'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), OneDriveState = _dereq_('../OneDriveState'), Popup = _dereq_('./Popup'), RedirectHelper = _dereq_('./RedirectHelper'), SaverOptions = _dereq_('../models/SaverOptions'), StringHelper = _dereq_('./StringHelper'), UploadType = _dereq_('../models/UploadType'), UrlHelper = _dereq_('./UrlHelper'), VroomHelper = _dereq_('./VroomHelper'), XHR = _dereq_('./XHR');
var POLLING_INTERVAL = 1000;
var POLLING_COUNTER = 5;
var SaverHelper = function () {
        function SaverHelper(options) {
            var clonedOptions = ObjectHelper.shallowClone(options);
            this._saverOptions = new SaverOptions(clonedOptions);
        }
        SaverHelper.prototype.launchSaver = function () {
            var _this = this;
            var saverOptions = this._saverOptions;
            if (saverOptions.invalidFile) {
                return;
            }
            var url = AccountChooserHelper.buildAccountChooserUrlForSaver();
            var windowState = saverOptions.serializeToWindowName();
            if (saverOptions.openInNewWindow) {
                var popup = new Popup(url, ObjectHelper.serializeJSON(windowState), function (response) {
                        _this.handleSaverSuccess(response);
                    }, function (response) {
                        _this.handleSaverError(response);
                    });
                if (!popup.openPopup()) {
                    saverOptions.error(Constants.ERROR_POPUP_OPEN);
                }
            } else {
                RedirectHelper.redirect(url, windowState);
            }
        };
        SaverHelper.prototype.handleSaverSuccess = function (saverResponse) {
            var _this = this;
            var pickerType = saverResponse.pickerType;
            switch (pickerType) {
            case Constants.STATE_MSA_PICKER:
                VroomHelper.callVroomSave(saverResponse, function (apiResponse) {
                    var apiResponseValue = apiResponse.value;
                    if (!apiResponseValue) {
                        ErrorHelper.throwError('empty API response');
                    }
                    var folderId = apiResponseValue[0].id;
                    if (!folderId || apiResponseValue.length !== 1) {
                        ErrorHelper.throwError('incorrect number of folders returned');
                    }
                    _this._executeUpload(saverResponse, folderId);
                }, function () {
                    _this._saverOptions.error(Constants.ERROR_WEB_REQUEST);
                });
                break;
            case Constants.STATE_AAD_PICKER:
                var folderIds = saverResponse.itemIds;
                if (folderIds.length !== 1) {
                    ErrorHelper.throwError('incorrect number of folders returned');
                }
                var folderId = folderIds[0];
                if (!folderId) {
                    folderId = 'root';
                }
                this._executeUpload(saverResponse, folderId);
                break;
            default:
                ErrorHelper.throwError('invalid value for picker type: ' + pickerType);
            }
        };
        SaverHelper.prototype.handleSaverError = function (errorResponse) {
            if (errorResponse.error === Constants.ERROR_ACCESS_DENIED) {
                this._saverOptions.cancel();
            } else {
                this._saverOptions.error({
                    errorCode: ErrorType.unknown,
                    message: 'something went wrong: ' + errorResponse.error
                });
            }
        };
        SaverHelper.prototype._executeUpload = function (saverResponse, folderId) {
            var uploadType = this._saverOptions.uploadType;
            Logging.logMessage(StringHelper.format('beginning \'{0}\' upload', UploadType[uploadType]));
            var accessToken = saverResponse.accessToken;
            switch (uploadType) {
            case UploadType.dataUrl:
            case UploadType.url:
                this._executeUrlUpload(saverResponse, folderId, accessToken, uploadType);
                break;
            case UploadType.form:
                this._executeFormUpload(saverResponse, folderId, accessToken);
                break;
            default:
                ErrorHelper.throwError('invalid value for upload type: ' + uploadType);
            }
        };
        SaverHelper.prototype._executeUrlUpload = function (saverResponse, folderId, accessToken, uploadType) {
            var _this = this;
            var options = this._saverOptions;
            if (uploadType === UploadType.url && saverResponse.pickerType === Constants.STATE_AAD_PICKER) {
                options.error({
                    errorCode: ErrorType.unsupportedFeature,
                    message: 'URL upload not supported for AAD'
                });
                return;
            }
            var uploadUrl = UrlHelper.appendToPath(saverResponse.apiEndpointUrl, 'drive/items/' + folderId + '/children');
            var requestHeaders = {};
            requestHeaders['Prefer'] = 'respond-async';
            requestHeaders['Authorization'] = 'bearer ' + accessToken;
            var body = {
                    '@content.sourceUrl': options.file,
                    'name': options.fileName,
                    'file': {}
                };
            var xhr = new XHR({
                    url: uploadUrl,
                    clientId: OneDriveState.clientIds.msaClientId,
                    method: Constants.HTTP_POST,
                    headers: requestHeaders,
                    json: ObjectHelper.serializeJSON(body),
                    apiEndpoint: saverResponse.apiEndpoint
                });
            xhr.start(function (xhr, statusCode) {
                if (uploadType === UploadType.dataUrl && (statusCode === 200 || statusCode === 201)) {
                    options.success();
                } else if (uploadType === UploadType.url && statusCode === 202) {
                    var location_1 = xhr.getResponseHeader('Location');
                    if (!location_1) {
                        options.error({
                            errorCode: ErrorType.badResponse,
                            message: 'missing \'Location\' header on response'
                        });
                    }
                    _this._beginPolling(location_1, accessToken);
                } else {
                    options.error(Constants.ERROR_WEB_REQUEST);
                }
            }, function (xhr, statusCode, timeout) {
                options.error(Constants.ERROR_WEB_REQUEST);
            });
        };
        SaverHelper.prototype._executeFormUpload = function (saverResponse, folderId, accessToken) {
            var options = this._saverOptions;
            var uploadSource = options.fileInput;
            var reader = null;
            if (window['File'] && uploadSource instanceof window['File']) {
                reader = new FileReader();
            } else {
                ErrorHelper.throwError('file reader not supported');
            }
            reader.onerror = function (event) {
                Logging.logError('failed to read or upload the file', event);
                options.error({
                    errorCode: ErrorType.fileReaderFailure,
                    message: 'failed to read or upload the file, see console log for details'
                });
            };
            reader.onload = function (event) {
                var uploadUrl = UrlHelper.appendToPath(saverResponse.apiEndpointUrl, 'drive/items/' + folderId + '/children/' + options.fileName + '/content');
                var queryParameters = {};
                queryParameters['@name.conflictBehavior'] = saverResponse.pickerType === Constants.STATE_AAD_PICKER ? 'fail' : 'rename';
                var requestHeaders = {};
                requestHeaders['Authorization'] = 'bearer ' + accessToken;
                var xhr = new XHR({
                        url: UrlHelper.appendQueryStrings(uploadUrl, queryParameters),
                        clientId: OneDriveState.clientIds.msaClientId,
                        headers: requestHeaders,
                        apiEndpoint: saverResponse.apiEndpoint
                    });
                var data = event.target.result;
                xhr.upload(data, function (xhr, statusCode) {
                    options.success();
                }, function (xhr, statusCode, timeout) {
                    options.error(Constants.ERROR_WEB_REQUEST);
                }, function (xhr, uploadProgress) {
                    options.progress(uploadProgress.progressPercentage);
                });
            };
            reader.readAsArrayBuffer(uploadSource);
        };
        SaverHelper.prototype._beginPolling = function (location, accessToken) {
            Logging.logMessage('polling for URL upload completion');
            var pollingInterval = POLLING_INTERVAL;
            var pollCount = POLLING_COUNTER;
            var xhrOptions = {
                    url: UrlHelper.appendQueryString(location, Constants.PARAM_ACCESS_TOKEN, accessToken),
                    method: Constants.HTTP_GET
                };
            var options = this._saverOptions;
            var pollForProgress = function () {
                var xhr = new XHR(xhrOptions);
                xhr.start(function (xhr, statusCode) {
                    switch (statusCode) {
                    case 202:
                        var apiResponse = ObjectHelper.deserializeJSON(xhr.responseText);
                        options.progress(apiResponse['percentageComplete']);
                        if (!pollCount--) {
                            pollingInterval *= 2;
                            pollCount = POLLING_COUNTER;
                        }
                        CallbackHelper.invokeCallbackAsynchronous(pollForProgress, pollingInterval);
                        break;
                    case 200:
                        options.progress(100);
                        options.success();
                        break;
                    default:
                        options.error(Constants.ERROR_WEB_REQUEST);
                    }
                }, function (xhr, statusCode, timeout) {
                    options.error(Constants.ERROR_WEB_REQUEST);
                });
            };
            CallbackHelper.invokeCallbackAsynchronous(pollForProgress, pollingInterval);
        };
        return SaverHelper;
    }();
module.exports = SaverHelper;
},{"../Constants":1,"../OneDriveState":4,"../models/ErrorType":6,"../models/SaverOptions":10,"../models/UploadType":11,"./AccountChooserHelper":12,"./CallbackHelper":13,"./ErrorHelper":15,"./Logging":17,"./ObjectHelper":18,"./Popup":20,"./RedirectHelper":21,"./StringHelper":24,"./UrlHelper":26,"./VroomHelper":27,"./XHR":29}],24:[function(_dereq_,module,exports){
var FORMAT_ARGS_REGEX = /[\{\}]/g;
var FORMAT_REGEX = /\{\d+\}/g;
var StringHelper = function () {
        function StringHelper() {
        }
        StringHelper.format = function (str) {
            var values = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                values[_i - 1] = arguments[_i];
            }
            var replacer = function (match) {
                var replacement = values[match.replace(FORMAT_ARGS_REGEX, '')];
                if (replacement === null) {
                    replacement = '';
                }
                return replacement;
            };
            return str.replace(FORMAT_REGEX, replacer);
        };
        return StringHelper;
    }();
module.exports = StringHelper;
},{}],25:[function(_dereq_,module,exports){
var Constants = _dereq_('../Constants'), ErrorHelper = _dereq_('./ErrorHelper'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), StringHelper = _dereq_('./StringHelper');
var TypeValidationHelper = function () {
        function TypeValidationHelper() {
        }
        TypeValidationHelper.validateType = function (object, expectedType, optional, defaultValue, validValues) {
            if (optional === void 0) {
                optional = false;
            }
            if (object === undefined) {
                if (optional) {
                    if (defaultValue === undefined) {
                        ErrorHelper.throwError('default value missing');
                    }
                    Logging.logMessage('applying default value: ' + defaultValue);
                    return defaultValue;
                } else {
                    ErrorHelper.throwError('object was missing and not optional');
                }
            }
            var objectType = typeof object;
            if (objectType !== expectedType) {
                ErrorHelper.throwError(StringHelper.format('expected object type: \'{0}\', actual object type: \'{1}\'', expectedType, objectType));
            }
            if (!TypeValidationHelper._isValidValue(object, validValues)) {
                ErrorHelper.throwError(StringHelper.format('object does not match any valid values: \'{0}\'', ObjectHelper.serializeJSON(validValues)));
            }
            return object;
        };
        TypeValidationHelper.validateCallback = function (functionOption, optional, expectGlobalFunction) {
            if (optional === void 0) {
                optional = false;
            }
            if (expectGlobalFunction === void 0) {
                expectGlobalFunction = false;
            }
            if (functionOption === undefined) {
                if (optional) {
                    return null;
                } else {
                    ErrorHelper.throwError('function was missing and not optional');
                }
            }
            var functionType = typeof functionOption;
            if (functionType !== Constants.TYPE_STRING && functionType !== Constants.TYPE_FUNCTION) {
                ErrorHelper.throwError(StringHelper.format('expected function type: \'function | string\', actual type: \'{0}\'', functionType));
            }
            var returnFunction = null;
            if (functionType === Constants.TYPE_STRING) {
                var globalFunction = window[functionOption];
                if (typeof globalFunction === Constants.TYPE_FUNCTION) {
                    returnFunction = globalFunction;
                } else {
                    ErrorHelper.throwError(StringHelper.format('could not find a function with name \'{0}\' on the window object', functionOption));
                }
            } else if (expectGlobalFunction) {
                ErrorHelper.throwError('expected a global function');
            } else {
                returnFunction = functionOption;
            }
            return returnFunction;
        };
        TypeValidationHelper._isValidValue = function (object, validValues) {
            if (!Array.isArray(validValues)) {
                return true;
            }
            for (var index in validValues) {
                if (object === validValues[index]) {
                    return true;
                }
            }
            return false;
        };
        return TypeValidationHelper;
    }();
module.exports = TypeValidationHelper;
},{"../Constants":1,"./ErrorHelper":15,"./Logging":17,"./ObjectHelper":18,"./StringHelper":24}],26:[function(_dereq_,module,exports){
var StringHelper = _dereq_('./StringHelper');
var UrlHelper = function () {
        function UrlHelper() {
        }
        UrlHelper.appendToPath = function (baseUrl, path) {
            return baseUrl + (baseUrl.charAt(baseUrl.length - 1) !== '/' ? '/' : '') + path;
        };
        UrlHelper.appendQueryString = function (baseUrl, queryKey, queryValue) {
            return UrlHelper.appendQueryStrings(baseUrl, (_a = {}, _a[queryKey] = queryValue, _a));
            var _a;
        };
        UrlHelper.appendQueryStrings = function (baseUrl, queryParameters) {
            if (!queryParameters || Object.keys(queryParameters).length === 0) {
                return baseUrl;
            }
            if (baseUrl.indexOf('?') === -1) {
                baseUrl += '?';
            } else if (baseUrl.charAt(baseUrl.length - 1) !== '&') {
                baseUrl += '&';
            }
            var queryString = '';
            for (var key in queryParameters) {
                queryString += (queryString.length ? '&' : '') + StringHelper.format('{0}={1}', encodeURIComponent(key), encodeURIComponent(queryParameters[key]));
            }
            return baseUrl + queryString;
        };
        UrlHelper.readCurrentUrlParameters = function () {
            return UrlHelper.readUrlParameters(window.location.href);
        };
        UrlHelper.readUrlParameters = function (url) {
            var queryParamters = {};
            var queryStart = url.indexOf('?') + 1;
            var hashStart = url.indexOf('#') + 1;
            if (queryStart > 0) {
                var queryEnd = hashStart > queryStart ? hashStart - 1 : url.length;
                UrlHelper._deserializeParameters(url.substring(queryStart, queryEnd), queryParamters);
            }
            if (hashStart > 0) {
                UrlHelper._deserializeParameters(url.substring(hashStart), queryParamters);
            }
            return queryParamters;
        };
        UrlHelper.trimUrlQuery = function (url) {
            var separators = [
                    '?',
                    '#'
                ];
            for (var index in separators) {
                var charIndex = url.indexOf(separators[index]);
                if (charIndex > 0) {
                    url = url.substring(0, charIndex);
                }
            }
            return url;
        };
        UrlHelper.getFileNameFromUrl = function (url) {
            var trimmedUrl = UrlHelper.trimUrlQuery(url);
            return trimmedUrl.substr(trimmedUrl.lastIndexOf('/') + 1);
        };
        UrlHelper.isPathFullUrl = function (path) {
            return path.indexOf('https://') === 0 || path.indexOf('http://') === 0;
        };
        UrlHelper.isPathDataUrl = function (path) {
            return path.indexOf('data:') === 0;
        };
        UrlHelper._deserializeParameters = function (query, queryParameters) {
            var properties = query.split('&');
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i].split('=');
                if (property.length === 2) {
                    queryParameters[decodeURIComponent(property[0])] = decodeURIComponent(property[1]);
                }
            }
        };
        return UrlHelper;
    }();
module.exports = UrlHelper;
},{"./StringHelper":24}],27:[function(_dereq_,module,exports){
var Constants = _dereq_('../Constants'), ErrorHelper = _dereq_('./ErrorHelper'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), OneDriveState = _dereq_('../OneDriveState'), UrlHelper = _dereq_('./UrlHelper'), XHR = _dereq_('./XHR');
var VroomHelper = function () {
        function VroomHelper() {
        }
        VroomHelper.callVroomOpen = function (response, getWebLinks, success, error) {
            VroomHelper._callVroom(response, getWebLinks, false, success, error);
        };
        VroomHelper.callVroomSave = function (response, success, error) {
            VroomHelper._callVroom(response, false, true, success, error);
        };
        VroomHelper._callVroom = function (response, getWebLinks, isSaver, success, error) {
            var apiEndpointUrl = response.apiEndpointUrl;
            var apiEndpoint = response.apiEndpoint;
            var accessToken = response.accessToken;
            var ownerCid = response.ownerCid;
            var itemId = response.itemId;
            var authKey = response.authKey;
            if (!authKey && getWebLinks) {
                ErrorHelper.throwError('missing auth key');
            }
            var queryParameters;
            if (getWebLinks) {
                apiEndpointUrl = UrlHelper.appendToPath(apiEndpointUrl, 'drives/' + ownerCid + '/items/' + itemId);
                queryParameters = {
                    authKey: authKey,
                    expand: 'thumbnails,children(select=id,webUrl,name,size;expand=thumbnails)',
                    select: 'id,webUrl,name,size'
                };
            } else {
                apiEndpointUrl = UrlHelper.appendToPath(apiEndpointUrl, 'drive/items/' + itemId + '/children');
                queryParameters = {};
                queryParameters[Constants.PARAM_ACCESS_TOKEN] = accessToken;
                if (isSaver) {
                    queryParameters['select'] = 'id';
                } else {
                    queryParameters['expand'] = 'thumbnails';
                    queryParameters['select'] = 'id,@content.downloadUrl,name,size';
                }
            }
            var xhr = new XHR({
                    url: UrlHelper.appendQueryStrings(apiEndpointUrl, queryParameters),
                    clientId: OneDriveState.clientIds.msaClientId,
                    method: Constants.HTTP_GET,
                    apiEndpoint: apiEndpoint
                });
            Logging.logMessage('performing GET on sharing bundle with id: ' + itemId);
            xhr.start(function (xhr, statusCode) {
                success(ObjectHelper.deserializeJSON(xhr.responseText));
            }, function (xhr, statusCode, timeout) {
                error();
            });
        };
        return VroomHelper;
    }();
module.exports = VroomHelper;
},{"../Constants":1,"../OneDriveState":4,"./ErrorHelper":15,"./Logging":17,"./ObjectHelper":18,"./UrlHelper":26,"./XHR":29}],28:[function(_dereq_,module,exports){
var ErrorHelper = _dereq_('./ErrorHelper'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), StringHelper = _dereq_('./StringHelper');
var WindowStateHelper = function () {
        function WindowStateHelper() {
        }
        WindowStateHelper.getWindowState = function () {
            return ObjectHelper.deserializeJSON(window.name || '{}');
        };
        WindowStateHelper.setWindowState = function (values, windowState) {
            if (windowState === void 0) {
                windowState = null;
            }
            if (windowState === null) {
                windowState = WindowStateHelper.getWindowState();
            }
            for (var property in values) {
                if (windowState[property] !== undefined) {
                    ErrorHelper.throwError(StringHelper.format('window.name object already has a value for key: \'{0}\'', property));
                }
                windowState[property] = values[property];
            }
            var serializedWindowState = ObjectHelper.serializeJSON(windowState);
            Logging.logMessage('window.name = ' + serializedWindowState);
            window.name = serializedWindowState;
        };
        return WindowStateHelper;
    }();
module.exports = WindowStateHelper;
},{"./ErrorHelper":15,"./Logging":17,"./ObjectHelper":18,"./StringHelper":24}],29:[function(_dereq_,module,exports){
var ApiEndpoint = _dereq_('../models/ApiEndpoint'), Constants = _dereq_('../Constants'), ErrorHelper = _dereq_('./ErrorHelper'), Logging = _dereq_('./Logging'), StringHelper = _dereq_('./StringHelper');
var REQUEST_TIMEOUT = 30000;
var EXCEPTION_STATUS = -1;
var TIMEOUT_STATUS = -2;
var ABORT_STATUS = -3;
var XHR = function () {
        function XHR(options) {
            this._url = options.url;
            this._json = options.json;
            this._headers = options.headers || {};
            this._method = options.method;
            this._clientId = options.clientId;
            this._apiEndpoint = options.apiEndpoint || ApiEndpoint.other;
            ErrorHelper.registerErrorObserver(this._abortRequest);
        }
        XHR.statusCodeToString = function (statusCode) {
            switch (statusCode) {
            case -1:
                return 'EXCEPTION';
            case -2:
                return 'TIMEOUT';
            case -3:
                return 'REQUEST ABORTED';
            default:
                return statusCode.toString();
            }
        };
        XHR.prototype.start = function (successCallback, failureCallback) {
            var _this = this;
            try {
                this._successCallback = successCallback;
                this._failureCallback = failureCallback;
                this._request = new XMLHttpRequest();
                this._request.ontimeout = this._onTimeout;
                this._request.timeout = REQUEST_TIMEOUT;
                this._request.onreadystatechange = function () {
                    if (!_this._completed && _this._request.readyState === 4) {
                        _this._completed = true;
                        var status_1 = _this._request.status;
                        if (status_1 < 400 && status_1 > 0) {
                            _this._callSuccessCallback(status_1);
                        } else {
                            _this._callFailureCallback(status_1);
                        }
                    }
                };
                if (!this._method) {
                    this._method = this._json ? Constants.HTTP_POST : Constants.HTTP_GET;
                }
                this._request.open(this._method, this._url, true);
                this._setHeaders();
                Logging.logMessage('starting request to: ' + this._url);
                this._request.send(this._json);
            } catch (error) {
                this._callFailureCallback(EXCEPTION_STATUS, error);
            }
        };
        XHR.prototype.upload = function (data, successCallback, failureCallback, progressCallback) {
            var _this = this;
            try {
                this._successCallback = successCallback;
                this._progressCallback = progressCallback;
                this._failureCallback = failureCallback;
                this._request = new XMLHttpRequest();
                this._request.ontimeout = this._onTimeout;
                this._method = Constants.HTTP_PUT;
                this._request.open(this._method, this._url, true);
                this._setHeaders();
                this._request.onload = function (event) {
                    _this._completed = true;
                    var status = _this._request.status;
                    if (status === 200 || status === 201) {
                        _this._callSuccessCallback(status);
                    } else {
                        _this._callFailureCallback(status, event);
                    }
                };
                this._request.onerror = function (event) {
                    _this._completed = true;
                    _this._callFailureCallback(_this._request.status, event);
                };
                this._request.upload.onprogress = function (event) {
                    if (event.lengthComputable) {
                        var uploadProgress = {
                                bytesTransferred: event.loaded,
                                totalBytes: event.total,
                                progressPercentage: event.total === 0 ? 0 : event.loaded / event.total * 100
                            };
                        _this._callProgressCallback(uploadProgress);
                    }
                };
                Logging.logMessage('starting upload to: ' + this._url);
                this._request.send(data);
            } catch (error) {
                this._callFailureCallback(EXCEPTION_STATUS, error);
            }
        };
        XHR.prototype._callSuccessCallback = function (status) {
            Logging.logMessage('calling xhr success callback, status: ' + XHR.statusCodeToString(status));
            this._successCallback(this._request, status);
        };
        XHR.prototype._callFailureCallback = function (status, error) {
            Logging.logError('calling xhr failure callback, status: ' + XHR.statusCodeToString(status), this._request, error);
            this._failureCallback(this._request, status, status === TIMEOUT_STATUS);
        };
        XHR.prototype._callProgressCallback = function (uploadProgress) {
            Logging.logMessage('calling xhr upload progress callback');
            this._progressCallback(this._request, uploadProgress);
        };
        XHR.prototype._abortRequest = function () {
            if (!this._completed) {
                this._completed = true;
                if (this._request) {
                    try {
                        this._request.abort();
                    } catch (error) {
                    }
                }
                this._callFailureCallback(ABORT_STATUS);
            }
        };
        XHR.prototype._onTimeout = function () {
            if (!this._completed) {
                this._completed = true;
                this._callFailureCallback(TIMEOUT_STATUS);
            }
        };
        XHR.prototype._setHeaders = function () {
            for (var x in this._headers) {
                this._request.setRequestHeader(x, this._headers[x]);
            }
            if (this._clientId && this._apiEndpoint !== ApiEndpoint.other) {
                this._request.setRequestHeader('Application', this._clientId);
            }
            var sdkVersion = StringHelper.format('{0}={1}', 'SDK-Version', Constants.SDK_VERSION);
            switch (this._apiEndpoint) {
            case ApiEndpoint.filesV2:
                this._request.setRequestHeader('X-ClientService-ClientTag', sdkVersion);
                break;
            case ApiEndpoint.vroom:
                this._request.setRequestHeader('X-RequestStats', sdkVersion);
                break;
            case ApiEndpoint.other:
                break;
            default:
                ErrorHelper.throwError('invalid API endpoint: ' + this._apiEndpoint);
            }
            if (this._method === Constants.HTTP_POST) {
                this._request.setRequestHeader('Content-Type', this._json ? 'application/json' : 'text/plain');
            }
        };
        return XHR;
    }();
module.exports = XHR;
},{"../Constants":1,"../models/ApiEndpoint":5,"./ErrorHelper":15,"./Logging":17,"./StringHelper":24}]},{},[2])
(2)
});
