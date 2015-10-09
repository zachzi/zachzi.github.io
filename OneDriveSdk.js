!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.OneDrive=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var Constants = function () {
        function Constants() {
        }
        Constants.HTTP_GET = 'GET';
        Constants.HTTP_POST = 'POST';
        Constants.LINKTYPE_WEB = 'webLink';
        Constants.LINKTYPE_DOWNLOAD = 'downloadLink';
        Constants.SCHEME_HTTP = 'http:';
        Constants.SCHEME_HTTPS = 'https:';
        Constants.SDK_VERSION = 'js-v2.0';
        Constants.TYPE_FUNCTION = 'function';
        Constants.TYPE_STRING = 'string';
        Constants.VROOM_URL = 'https://api.onedrive.com/v1.0/';
        return Constants;
    }();
module.exports = Constants;
},{}],2:[function(_dereq_,module,exports){
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
var DomHelper = _dereq_('./utilities/DomHelper'), ErrorHelper = _dereq_('./utilities/ErrorHelper'), Logging = _dereq_('./utilities/Logging'), OneDriveState = _dereq_('./OneDriveState'), PickerHelper = _dereq_('./utilities/PickerHelper'), PickerOptions = _dereq_('./models/PickerOptions'), RedirectHelper = _dereq_('./utilities/RedirectHelper'), ResponseHelper = _dereq_('./utilities/ResponseHelper'), SaverHelper = _dereq_('./utilities/SaverHelper'), SaverOptions = _dereq_('./models/SaverOptions');
var OneDriveApp = function () {
        function OneDriveApp() {
        }
        OneDriveApp.onloadInit = function () {
            ErrorHelper.registerErrorObserver(function () {
                OneDriveState.clearState();
            });
            DomHelper.getScriptInput();
            Logging.log('initialized');
            var redirectResponse = RedirectHelper.handleRedirect();
            if (!redirectResponse) {
                return;
            }
            var pickerResponse = ResponseHelper.parsePickerResponse(redirectResponse);
            if (pickerResponse) {
                var options = redirectResponse.state.options;
                var mode = options.mode;
                switch (mode) {
                case 'open':
                    var pickerOptions = new PickerOptions(options);
                    if (pickerResponse.error) {
                        PickerHelper.handlePickerError(pickerResponse, pickerOptions);
                    } else {
                        PickerHelper.handlePickerSuccess(pickerResponse, pickerOptions);
                    }
                    break;
                case 'save':
                    var saverOptions = new SaverOptions(options);
                    if (pickerResponse.error) {
                        SaverHelper.handleSaverError(pickerResponse, saverOptions);
                    } else {
                        SaverHelper.handleSaverSuccess(pickerResponse, saverOptions);
                    }
                    break;
                default:
                    ErrorHelper.throwError('invalid value for options.mode: ' + mode);
                }
            } else {
                Logging.log('couldn\'t parse response');
            }
        };
        OneDriveApp.open = function (options) {
            if (!OneDriveState.readyCheck()) {
                return;
            }
            if (!options) {
                ErrorHelper.throwError('missing picker options');
            }
            Logging.log('open started');
            PickerHelper.run(options);
        };
        OneDriveApp.save = function (options) {
            if (!OneDriveState.readyCheck()) {
                return;
            }
            if (!options) {
                ErrorHelper.throwError('missing saver options');
            }
            Logging.log('save started');
            SaverHelper.run(options);
        };
        return OneDriveApp;
    }();
module.exports = OneDriveApp;
},{"./OneDriveState":4,"./models/PickerOptions":9,"./models/SaverOptions":10,"./utilities/DomHelper":14,"./utilities/ErrorHelper":15,"./utilities/Logging":17,"./utilities/PickerHelper":19,"./utilities/RedirectHelper":20,"./utilities/ResponseHelper":21,"./utilities/SaverHelper":22}],4:[function(_dereq_,module,exports){
var OneDriveState = function () {
        function OneDriveState() {
        }
        OneDriveState.clearState = function () {
            OneDriveState._sdkReady = true;
        };
        OneDriveState.readyCheck = function () {
            if (!OneDriveState.clientIds || !OneDriveState._sdkReady) {
                return false;
            }
            OneDriveState._sdkReady = false;
            return true;
        };
        OneDriveState._sdkReady = true;
        return OneDriveState;
    }();
module.exports = OneDriveState;
},{}],5:[function(_dereq_,module,exports){
var CallbackHelper = _dereq_('./utilities/CallbackHelper'), Logging = _dereq_('./utilities/Logging'), ResponseHelper = _dereq_('./utilities/ResponseHelper');
var POPUP_WIDTH = 800;
var POPUP_HEIGHT = 650;
var POPUP_PINGER_INTERVAL = 500;
var Popup = function () {
        function Popup(url, name, successCallback, errorCallabck) {
            this._messageCallbackInvoked = false;
            this._name = name;
            this._url = url;
            this._successCallback = successCallback;
            this._errorCallback = errorCallabck;
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
                            CallbackHelper.invokeCallbackAsynchronous(currentPopup._errorCallback, response);
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
                            Logging.log('closed callback');
                            _this._errorCallback({ 'error': 'access_denied' });
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
},{"./utilities/CallbackHelper":13,"./utilities/Logging":17,"./utilities/ResponseHelper":21}],6:[function(_dereq_,module,exports){
var ApiEndpoint = _dereq_('./models/ApiEndpoint'), Constants = _dereq_('./Constants'), Logging = _dereq_('./utilities/Logging'), ObjectHelper = _dereq_('./utilities/ObjectHelper'), StringHelper = _dereq_('./utilities/StringHelper');
var DEFAULT_TIMEOUT_MS = 30000;
var EXCEPTION_STATUS = -1;
var TIMEOUT_STATUS = -2;
var XHR = function () {
        function XHR(options) {
            this._url = options.url;
            this._requestTimeoutInMS = options.requestTimeoutInMS || DEFAULT_TIMEOUT_MS;
            this._json = options.json;
            this._headers = options.headers || {};
            this._method = options.method;
            this._clientId = options.clientId;
            this._apiEndpoint = options.apiEndpoint || ApiEndpoint.other;
        }
        XHR.prototype.start = function (successCallback, failureCallback) {
            var _this = this;
            try {
                this._successCallback = successCallback;
                this._failureCallback = failureCallback;
                this._createXHR();
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
                this._openXHR();
                for (var x in this._headers) {
                    this._request.setRequestHeader(x, this._headers[x]);
                }
                this._request.timeout = this._requestTimeoutInMS;
                this._request.send(this._json);
            } catch (error) {
                Logging.log('error ' + error);
                this._callFailureCallback(EXCEPTION_STATUS);
            }
        };
        XHR.prototype.upload = function (data, successCallback, failureCallback, progressCallback) {
            var _this = this;
            try {
                this._successCallback = successCallback;
                this._progressCallback = progressCallback;
                this._failureCallback = failureCallback;
                this._createXHR();
                if (!this._method) {
                    this._method = Constants.HTTP_POST;
                }
                if (this._method !== Constants.HTTP_POST) {
                    Logging.log('must be post');
                }
                this._openXHR();
                this._request.onload = function (event) {
                    var responseText = event.currentTarget.responseText;
                    var status = _this._request.status;
                    var uploadResponse = ObjectHelper.deserializeJSON(responseText);
                    if (uploadResponse.error) {
                        Logging.log('upload error ' + responseText);
                        _this._callFailureCallback(status);
                    } else {
                        Logging.log('upload success ' + responseText);
                        _this._callSuccessCallback(status);
                    }
                };
                this._request.onerror = function (event) {
                    Logging.log('upload error ' + event.currentTarget.statusText);
                    _this._callFailureCallback(_this._request.status);
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
                this._request.send(data);
            } catch (error) {
                Logging.log('error ' + error);
                this._callFailureCallback(EXCEPTION_STATUS);
            }
        };
        XHR.prototype._callSuccessCallback = function (status) {
            try {
                if (this._successCallback) {
                    this._successCallback(this._request, status);
                }
            } catch (error) {
                Logging.log('success callback error');
            }
        };
        XHR.prototype._callProgressCallback = function (uploadProgress) {
            try {
                if (this._progressCallback) {
                    this._progressCallback(this._request, uploadProgress);
                }
            } catch (error) {
                Logging.log('progress callback error');
            }
        };
        XHR.prototype._callFailureCallback = function (status) {
            try {
                if (this._failureCallback) {
                    this._failureCallback(this._request, status, status === TIMEOUT_STATUS);
                }
            } catch (error) {
                Logging.log('failure callback error');
            }
        };
        XHR.prototype._createXHR = function () {
            var _this = this;
            this._request = new XMLHttpRequest();
            this._request.ontimeout = function () {
                Logging.log('timeout');
                _this._callFailureCallback(TIMEOUT_STATUS);
            };
        };
        XHR.prototype._openXHR = function () {
            this._request.open(this._method, this._url, true);
            this._setDefaultHeaders();
        };
        XHR.prototype._setDefaultHeaders = function () {
            if (this._clientId) {
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
                Logging.log('bad api endpoint');
            }
            if (this._method === Constants.HTTP_POST) {
                this._request.setRequestHeader('Content-Type', this._json ? 'application/json' : 'text/plain');
            }
        };
        return XHR;
    }();
module.exports = XHR;
},{"./Constants":1,"./models/ApiEndpoint":7,"./utilities/Logging":17,"./utilities/ObjectHelper":18,"./utilities/StringHelper":23}],7:[function(_dereq_,module,exports){
var ApiEndpoint;
(function (ApiEndpoint) {
    ApiEndpoint[ApiEndpoint['filesV2'] = 0] = 'filesV2';
    ApiEndpoint[ApiEndpoint['other'] = 1] = 'other';
    ApiEndpoint[ApiEndpoint['vroom'] = 2] = 'vroom';
}(ApiEndpoint || (ApiEndpoint = {})));
module.exports = ApiEndpoint;
},{}],8:[function(_dereq_,module,exports){
var CallbackHelper = _dereq_('../utilities/CallbackHelper'), Logging = _dereq_('../utilities/Logging'), StringHelper = _dereq_('../utilities/StringHelper'), TypeValidationHelper = _dereq_('../utilities/TypeValidationHelper');
var InvokerOptions = function () {
        function InvokerOptions(options) {
            this.openInNewWindow = TypeValidationHelper.validateType(options.openInNewWindow, 'boolean', true, true);
            this.expectGlobalFunction = !this.openInNewWindow;
            if (this.expectGlobalFunction) {
                this.cancelName = options.cancel;
                this.errorName = options.error;
            }
            var cancelCallback = TypeValidationHelper.validateCallback(options.cancel, true, this.expectGlobalFunction);
            this.cancel = function () {
                Logging.log('user cancelled operation');
                CallbackHelper.invokeAppCallback(cancelCallback, true);
            };
            var errorCallback = TypeValidationHelper.validateCallback(options.error, true, this.expectGlobalFunction);
            this.error = function (error) {
                Logging.log(StringHelper.format('error occured - code: \'{0}\', message: \'{1}\'', error.errorCode, error.message));
                CallbackHelper.invokeAppCallback(errorCallback, true, error);
            };
        }
        return InvokerOptions;
    }();
module.exports = InvokerOptions;
},{"../utilities/CallbackHelper":13,"../utilities/Logging":17,"../utilities/StringHelper":23,"../utilities/TypeValidationHelper":24}],9:[function(_dereq_,module,exports){
var CallbackHelper = _dereq_('../utilities/CallbackHelper'), Constants = _dereq_('../Constants'), InvokerOptions = _dereq_('./InvokerOptions'), Logging = _dereq_('../utilities/Logging'), TypeValidationHelper = _dereq_('../utilities/TypeValidationHelper');
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
                Logging.log('picker operation succeeded');
                CallbackHelper.invokeAppCallback(successCallback, true, files);
            };
            this.multiSelect = TypeValidationHelper.validateType(options.multiSelect, 'boolean', true, false);
            this.linkType = TypeValidationHelper.validateType(options.linkType, 'string', true, Constants.LINKTYPE_WEB, VALID_LINKTYPE_VALUES);
        }
        return PickerOptions;
    }(InvokerOptions);
module.exports = PickerOptions;
},{"../Constants":1,"../utilities/CallbackHelper":13,"../utilities/Logging":17,"../utilities/TypeValidationHelper":24,"./InvokerOptions":8}],10:[function(_dereq_,module,exports){
var CallbackHelper = _dereq_('../utilities/CallbackHelper'), DomHelper = _dereq_('../utilities/DomHelper'), ErrorHelper = _dereq_('../utilities/ErrorHelper'), InvokerOptions = _dereq_('./InvokerOptions'), Logging = _dereq_('../utilities/Logging'), StringHelper = _dereq_('../utilities/StringHelper'), TypeValidationHelper = _dereq_('../utilities/TypeValidationHelper'), UploadType = _dereq_('./UploadType'), UrlHelper = _dereq_('../utilities/UrlHelper');
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
                Logging.log('saver operation succeeded');
                CallbackHelper.invokeAppCallback(successCallback, true);
            };
            var progressCallback = TypeValidationHelper.validateCallback(options.progress, true, this.expectGlobalFunction);
            this.progress = function (percentage) {
                Logging.log(StringHelper.format('upload progress {0}%', percentage));
                CallbackHelper.invokeAppCallback(progressCallback, false, percentage);
            };
            this._setFileInfo(options);
        }
        SaverOptions.prototype._setFileInfo = function (options) {
            this.file = TypeValidationHelper.validateType(options.file, 'string');
            var fileName = TypeValidationHelper.validateType(options.fileName, 'string', true, null);
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
},{"../utilities/CallbackHelper":13,"../utilities/DomHelper":14,"../utilities/ErrorHelper":15,"../utilities/Logging":17,"../utilities/StringHelper":23,"../utilities/TypeValidationHelper":24,"../utilities/UrlHelper":25,"./InvokerOptions":8,"./UploadType":11}],11:[function(_dereq_,module,exports){
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
            Logging.log('invoking account chooser: ' + fullUrl);
            return fullUrl;
        };
        return AccountChooserHelper;
    }();
module.exports = AccountChooserHelper;
},{"../OneDriveState":4,"./Logging":17,"./UrlHelper":25}],13:[function(_dereq_,module,exports){
var OneDriveState = _dereq_('../OneDriveState');
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
            if (typeof callback === 'function') {
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
},{"../OneDriveState":4}],14:[function(_dereq_,module,exports){
var ErrorHelper = _dereq_('./ErrorHelper'), Logging = _dereq_('./Logging'), OneDriveState = _dereq_('../OneDriveState'), StringHelper = _dereq_('./StringHelper');
var DOM_CLIENT_ID = 'client-id';
var DOM_LOGGING_ID = 'disable-logging';
var DOM_SDK_ID = 'onedrive-js';
var MSA_APPID_PATTERN = new RegExp('^([a-fA-F0-9]){16}$');
var AAD_APPID_PATTERN = new RegExp('^[a-fA-F\\d]{8}-([a-fA-F\\d]{4}-){3}[a-fA-F\\d]{12}$');
var DomHelper = function () {
        function DomHelper() {
        }
        DomHelper.getScriptInput = function () {
            var element = DomHelper.getElementById(DOM_SDK_ID);
            if (element) {
                var disableLogging = element.getAttribute(DOM_LOGGING_ID);
                if (disableLogging === 'true') {
                    Logging.loggingEnabled = false;
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
                        Logging.log('parsed MSA client id: ' + clientId);
                        clientIds.msaClientId = clientId;
                    } else if (AAD_APPID_PATTERN.test(clientId)) {
                        Logging.log('parsed AAD client id: ' + clientId);
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
},{"../OneDriveState":4,"./ErrorHelper":15,"./Logging":17,"./StringHelper":23}],15:[function(_dereq_,module,exports){
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
            for (var i = 0; i < callbacks.length; i++) {
                try {
                    callbacks[i]();
                } catch (error) {
                    Logging.log(error.message);
                }
            }
            throw new Error(ERROR_PREFIX + message);
        };
        ErrorHelper._errorObservers = [];
        return ErrorHelper;
    }();
module.exports = ErrorHelper;
},{"./Logging":17}],16:[function(_dereq_,module,exports){
var Constants = _dereq_('../Constants'), ObjectHelper = _dereq_('./ObjectHelper'), OneDriveState = _dereq_('../OneDriveState'), StringHelper = _dereq_('./StringHelper'), UrlHelper = _dereq_('./UrlHelper'), XHR = _dereq_('../XHR');
var BATCH_SIZE = 10;
var FilesV2Helper = function () {
        function FilesV2Helper() {
        }
        FilesV2Helper.callFilesV2Open = function (response, generateSharingLinks, success, error) {
            var accessToken = response.accessToken;
            var clientId = OneDriveState.clientIds.aadClientId;
            var itemIds = response.itemIds;
            var apiEndpointUrl = response.apiEndpointUrl;
            var apiEndpoint = response.apiEndpoint;
            var queryParameters = {};
            queryParameters['expand'] = 'thumbnails';
            queryParameters['select'] = 'id,name,size';
            var requestHeaders = {};
            requestHeaders['Authorization'] = 'bearer ' + accessToken;
            var successObjects = [];
            var errorObjects = [];
            var totalResponses = 0;
            var numItems = itemIds.length;
            var invokeCallbacks;
            var runBatch = function (batchStart, batchEnd) {
                for (var i = batchStart; i < batchEnd; i++) {
                    (function (itemId) {
                        var url = UrlHelper.appendToPath(apiEndpointUrl, 'drive/items/' + itemId);
                        var xhr = new XHR({
                                url: UrlHelper.appendQueryStrings(url, queryParameters),
                                clientId: clientId,
                                method: Constants.HTTP_GET,
                                apiEndpoint: apiEndpoint,
                                headers: requestHeaders
                            });
                        xhr.start(function (xhr, statusCode) {
                            successObjects.push(ObjectHelper.deserializeJSON(xhr.responseText));
                            invokeCallbacks();
                        }, function (xhr, statusCode, timeout) {
                            errorObjects.push({ error: StringHelper.format('GET on item \'{0}\' failed with status code \'{1}', itemId, statusCode) });
                            invokeCallbacks();
                        });
                    }(itemIds[i]));
                }
            };
            invokeCallbacks = function () {
                if (++totalResponses === numItems) {
                    if (successObjects.length > 0) {
                        success({ files: successObjects });
                    }
                    if (errorObjects.length > 0) {
                        error(errorObjects);
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
},{"../Constants":1,"../OneDriveState":4,"../XHR":6,"./ObjectHelper":18,"./StringHelper":23,"./UrlHelper":25}],17:[function(_dereq_,module,exports){
var LOG_PREFIX = '[OneDriveSDK] ';
var Logging = function () {
        function Logging() {
        }
        Logging.log = function (message) {
            if (Logging.loggingEnabled) {
                console.log(LOG_PREFIX + message);
            }
        };
        Logging.loggingEnabled = true;
        return Logging;
    }();
module.exports = Logging;
},{}],18:[function(_dereq_,module,exports){
var Logging = _dereq_('./Logging');
var ObjectHelper = function () {
        function ObjectHelper() {
        }
        ObjectHelper.shallowClone = function (object) {
            if (typeof object !== 'object' || !object) {
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
                Logging.log('deserialization error: ' + error.message);
            }
            if (typeof deserializedObject !== 'object' || deserializedObject === null) {
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
},{"./Logging":17}],19:[function(_dereq_,module,exports){
var AccountChooserHelper = _dereq_('./AccountChooserHelper'), Constants = _dereq_('../Constants'), FilesV2Helper = _dereq_('./FilesV2Helper'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), Popup = _dereq_('../Popup'), PickerOptions = _dereq_('../models/PickerOptions'), RedirectHelper = _dereq_('./RedirectHelper'), VroomHelper = _dereq_('./VroomHelper');
var VROOM_THUMBNAIL_SIZES = [
        'large',
        'medium',
        'small'
    ];
var PickerHelper = function () {
        function PickerHelper() {
        }
        PickerHelper.run = function (options) {
            var clonedOptions = ObjectHelper.shallowClone(options);
            var pickerOptions = new PickerOptions(clonedOptions);
            var url = AccountChooserHelper.buildAccountChooserUrlForPicker(pickerOptions);
            var windowState = PickerHelper._createWindowName(pickerOptions);
            if (pickerOptions.openInNewWindow) {
                var popup = new Popup(url, ObjectHelper.serializeJSON(windowState), function (response) {
                        PickerHelper.handlePickerSuccess(response, pickerOptions);
                    }, function (response) {
                        PickerHelper.handlePickerError(response, pickerOptions);
                    });
                if (!popup.openPopup()) {
                    Logging.log('popup error');
                }
            } else {
                RedirectHelper.redirect(url, windowState);
            }
        };
        PickerHelper.handlePickerSuccess = function (pickerResponse, options) {
            var linkType = options.linkType;
            var isWebLinkType = linkType === Constants.LINKTYPE_WEB;
            var pickerType = pickerResponse.pickerType;
            switch (pickerType) {
            case 'msa_picker':
                PickerHelper._handleMSAOpenResponse(pickerResponse, options, linkType, isWebLinkType);
                break;
            case 'aad_picker':
                PickerHelper._handleAADOpenResponse(pickerResponse, options, linkType, isWebLinkType);
                break;
            default:
                Logging.log('bad state ' + pickerType);
            }
        };
        PickerHelper.handlePickerError = function (errorResponse, options) {
            if (errorResponse.error === 'access_denied') {
                options.cancel();
            } else {
                options.error(errorResponse);
            }
        };
        PickerHelper._handleMSAOpenResponse = function (pickerResponse, options, linkType, isWebLinkType) {
            VroomHelper.callVroomOpen(pickerResponse, isWebLinkType, function (apiResponse) {
                var response = {
                        webUrl: apiResponse.webUrl,
                        files: isWebLinkType ? apiResponse.children && apiResponse.children.length > 0 ? apiResponse.children : [apiResponse] : apiResponse.value
                    };
                if (!response.files) {
                    Logging.log('no files');
                }
                PickerHelper._handleSuccessResponse(response, options, linkType, isWebLinkType);
            }, function (apiError) {
                options.error(apiError);
            });
        };
        PickerHelper._handleAADOpenResponse = function (pickerResponse, options, linkType, isWebLinkType) {
            FilesV2Helper.callFilesV2Open(pickerResponse, isWebLinkType, function (apiResponse) {
                if (isWebLinkType) {
                    options.error({
                        errorCode: -1,
                        message: 'web link not supported for AAD'
                    });
                    return;
                }
                PickerHelper._handleSuccessResponse(apiResponse, options, linkType, isWebLinkType);
            }, function (apiError) {
                options.error({
                    errorCode: -1,
                    message: 'foo'
                });
            });
        };
        PickerHelper._handleSuccessResponse = function (response, options, linkType, isWebLinkType) {
            var files = {
                    link: isWebLinkType ? response.webUrl : null,
                    values: []
                };
            var pickerFiles = response.files;
            for (var i = 0; i < pickerFiles.length; i++) {
                var file = pickerFiles[i];
                var thumbnails = [];
                var fileLink = isWebLinkType ? file.webUrl : file['@content.downloadUrl'];
                var fileThumbnails = file.thumbnails && file.thumbnails[0];
                if (fileThumbnails) {
                    for (var j = 0; j < VROOM_THUMBNAIL_SIZES.length; j++) {
                        thumbnails.push(fileThumbnails[VROOM_THUMBNAIL_SIZES[j]].url);
                    }
                }
                files.values.push({
                    fileName: file.name,
                    link: fileLink,
                    linkType: linkType,
                    size: file.size,
                    thumbnails: thumbnails
                });
            }
            options.success(files);
        };
        PickerHelper._createWindowName = function (options) {
            return {
                options: {
                    mode: 'open',
                    success: options.successName,
                    cancel: options.cancelName,
                    error: options.errorName,
                    linkType: options.linkType,
                    multiSelect: options.multiSelect,
                    openInNewWindow: options.openInNewWindow
                }
            };
        };
        return PickerHelper;
    }();
module.exports = PickerHelper;
},{"../Constants":1,"../Popup":5,"../models/PickerOptions":9,"./AccountChooserHelper":12,"./FilesV2Helper":16,"./Logging":17,"./ObjectHelper":18,"./RedirectHelper":20,"./VroomHelper":26}],20:[function(_dereq_,module,exports){
var CallbackHelper = _dereq_('./CallbackHelper'), Constants = _dereq_('../Constants'), DomHelper = _dereq_('./DomHelper'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), OneDriveState = _dereq_('../OneDriveState'), Popup = _dereq_('../Popup'), TypeValidationHelper = _dereq_('./TypeValidationHelper'), UrlHelper = _dereq_('./UrlHelper'), WindowStateHelper = _dereq_('./WindowStateHelper'), XHR = _dereq_('../XHR');
var AAD_LOGIN_URL = 'https://login.microsoftonline.com/common/oauth2/authorize';
var DISCOVERY_URL = 'https://onedrive.live.com/picker/businessurldiscovery';
var RESPONSE_TIMEOUT = 2000;
var RedirectHelper = function () {
        function RedirectHelper() {
        }
        RedirectHelper.redirect = function (url, values, windowState) {
            if (windowState === void 0) {
                windowState = null;
            }
            WindowStateHelper.setWindowState(values, windowState);
            window.location.replace(url);
        };
        RedirectHelper.handleRedirect = function () {
            var queryParameters = UrlHelper.readCurrentUrlParameters();
            var serializedState = WindowStateHelper.getWindowState();
            if (queryParameters['error'] === 'access_denied') {
                queryParameters['state'] = 'msa_picker';
            }
            var redirectState = queryParameters['state'] || serializedState['state'];
            if (!redirectState) {
                return;
            }
            var options = serializedState['options'];
            if (!options) {
                Logging.log('missing options');
            }
            var openInNewWindow = TypeValidationHelper.validateType(options.openInNewWindow, 'boolean');
            if (openInNewWindow) {
                RedirectHelper._displayOverlay();
            }
            switch (redirectState) {
            case 'discovery':
                if (!openInNewWindow) {
                    RedirectHelper._displayOverlay();
                }
                RedirectHelper._handleDiscoverRedirect(queryParameters);
                break;
            case 'aad_tenant_login':
                if (!openInNewWindow) {
                    RedirectHelper._displayOverlay();
                }
                RedirectHelper._handleAADTenantLoginRedirect(queryParameters);
                break;
            case 'msa_picker':
            case 'aad_picker':
                var pickerResponse = {
                        state: serializedState,
                        queryParameters: queryParameters
                    };
                if (openInNewWindow) {
                    RedirectHelper._sendResponse(pickerResponse);
                } else {
                    return pickerResponse;
                }
                break;
            default:
                Logging.log('bad state ' + redirectState);
            }
            return null;
        };
        RedirectHelper._handleDiscoverRedirect = function (queryParameters) {
            var accessToken = queryParameters['access_token'];
            if (!accessToken) {
                Logging.log('missing access token');
            }
            var xhr = new XHR({
                    url: UrlHelper.appendQueryString(DISCOVERY_URL, 'access_token', accessToken),
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
                        state: 'aad_tenant_login'
                    };
                var stateValue = [{
                            key: 'discovery',
                            value: {
                                tenantUrl: tenantUrl,
                                apiEndpoint: apiEndpoint
                            }
                        }];
                RedirectHelper.redirect(UrlHelper.appendQueryStrings(AAD_LOGIN_URL, queryParameters), stateValue);
            }, function (xhr, statusCode, timeout) {
                RedirectHelper._sendResponse({ error: 'discover request fails ' + statusCode });
            });
        };
        RedirectHelper._handleAADTenantLoginRedirect = function (queryParameters) {
            var accessToken = queryParameters['access_token'];
            if (!accessToken) {
                Logging.log('missing api access token');
            }
            var stateValues = [
                    {
                        key: 'aad_access_token',
                        value: accessToken
                    },
                    {
                        key: 'state',
                        value: 'aad_picker'
                    }
                ];
            var windowState = WindowStateHelper.getWindowState();
            var tenantUrl = windowState.discovery.tenantUrl;
            if (!tenantUrl) {
                Logging.log('missing tenant url');
            }
            RedirectHelper.redirect(UrlHelper.appendToPath(tenantUrl, 'MySiteRedirect.aspx?MySiteRedirect=AllDocuments#p=2'), stateValues, windowState);
        };
        RedirectHelper._sendResponse = function (response) {
            var pingTimeout = window.setTimeout(function () {
                    Logging.log('ping missing');
                    window.close();
                }, RESPONSE_TIMEOUT);
            window.addEventListener('message', function (event) {
                if (!Popup.canReceiveMessage(event)) {
                    return;
                }
                window.clearTimeout(pingTimeout);
                Logging.log('sending response back: ' + JSON.stringify(response));
                event.source.postMessage(response, window.location.origin);
                CallbackHelper.invokeCallbackAsynchronous(function () {
                    window.close();
                });
            });
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
            overlay.style.cssText = overlayStyle.join(';');
            var spinner = document.createElement('img');
            spinner.src = 'https://p.sfx.ms/common/spinner_grey_40_transparent.gif';
            var spinnerStyle = [
                    'position: absolute',
                    'top: calc(50% - 40px)',
                    'left: calc(50% - 40px)'
                ];
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
},{"../Constants":1,"../OneDriveState":4,"../Popup":5,"../XHR":6,"./CallbackHelper":13,"./DomHelper":14,"./Logging":17,"./ObjectHelper":18,"./TypeValidationHelper":24,"./UrlHelper":25,"./WindowStateHelper":27}],21:[function(_dereq_,module,exports){
var ApiEndpoint = _dereq_('../models/ApiEndpoint'), Constants = _dereq_('../Constants'), ErrorHelper = _dereq_('./ErrorHelper'), Logging = _dereq_('./Logging');
var CID_PADDING = '0000000000000000';
var CID_PADDING_LENGTH = CID_PADDING.length;
var MSA_SCOPE_RESPONSE_PATTERN = new RegExp('^\\w+\\.\\w+:\\w+[\\|\\w+]+:([\\w]+\\!\\d+)(?:\\!(.+))*$');
var ResponseHelper = function () {
        function ResponseHelper() {
        }
        ResponseHelper.parsePickerResponse = function (response) {
            var serializedState = response.state;
            var queryParameters = response.queryParameters;
            var responseError = queryParameters['error'];
            if (responseError) {
                return { error: responseError };
            }
            var pickerType = queryParameters['state'];
            var result = { pickerType: pickerType };
            switch (pickerType) {
            case 'msa_picker':
                ResponseHelper._handleMSAResponse(queryParameters, result);
                break;
            case 'aad_picker':
                ResponseHelper._handleAADResponse(serializedState, queryParameters, result);
                break;
            default:
                ErrorHelper.throwError('invalid value for picker type: ' + pickerType);
            }
            return result;
        };
        ResponseHelper._handleMSAResponse = function (queryParameters, result) {
            result.accessToken = queryParameters['access_token'];
            result.apiEndpointUrl = Constants.VROOM_URL;
            result.apiEndpoint = ApiEndpoint.vroom;
            var responseScope = queryParameters['scope'];
            var scopeResult = MSA_SCOPE_RESPONSE_PATTERN.exec(responseScope);
            if (scopeResult) {
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
                Logging.log('parsed MSA response for item: ' + itemId);
            } else {
                ErrorHelper.throwError('scope was not formatted correctly');
            }
        };
        ResponseHelper._handleAADResponse = function (state, queryParameters, result) {
            result.accessToken = state.aad_access_token;
            result.apiEndpointUrl = state.discovery.apiEndpoint;
            result.apiEndpoint = ApiEndpoint.filesV2;
            var itemIds = queryParameters['item-id'].split(',');
            if (!itemIds.length) {
                ErrorHelper.throwError('missing item id(s)');
            }
            result.itemIds = itemIds;
        };
        ResponseHelper._leftPadCid = function (cid) {
            return CID_PADDING.substring(0, CID_PADDING_LENGTH - cid.length) + cid;
        };
        return ResponseHelper;
    }();
module.exports = ResponseHelper;
},{"../Constants":1,"../models/ApiEndpoint":7,"./ErrorHelper":15,"./Logging":17}],22:[function(_dereq_,module,exports){
var AccountChooserHelper = _dereq_('./AccountChooserHelper'), CallbackHelper = _dereq_('./CallbackHelper'), Constants = _dereq_('../Constants'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), OneDriveState = _dereq_('../OneDriveState'), Popup = _dereq_('../Popup'), RedirectHelper = _dereq_('./RedirectHelper'), SaverOptions = _dereq_('../models/SaverOptions'), UploadType = _dereq_('../models/UploadType'), UrlHelper = _dereq_('./UrlHelper'), VroomHelper = _dereq_('./VroomHelper'), XHR = _dereq_('../XHR');
var POLLING_INTERVAL = 1000;
var POLLING_COUNTER = 5;
var SaverHelper = function () {
        function SaverHelper() {
        }
        SaverHelper.run = function (options) {
            var clonedOptions = ObjectHelper.shallowClone(options);
            var saverOptions = new SaverOptions(clonedOptions);
            if (saverOptions.invalidFile) {
                return;
            }
            var url = AccountChooserHelper.buildAccountChooserUrlForSaver();
            var windowState = SaverHelper._createWindowName(saverOptions);
            if (saverOptions.openInNewWindow) {
                var popup = new Popup(url, ObjectHelper.serializeJSON(windowState), function (response) {
                        SaverHelper.handleSaverSuccess(response, saverOptions);
                    }, function (response) {
                        SaverHelper.handleSaverError(response, saverOptions);
                    });
                if (!popup.openPopup()) {
                    Logging.log('popup error');
                }
            } else {
                RedirectHelper.redirect(url, windowState);
            }
        };
        SaverHelper.handleSaverSuccess = function (saverResponse, options) {
            var pickerType = saverResponse.pickerType;
            switch (pickerType) {
            case 'msa_picker':
                VroomHelper.callVroomSave(saverResponse, function (apiResponse) {
                    var folderId = apiResponse.value && apiResponse.value[0] && apiResponse.value[0].id;
                    if (!folderId || apiResponse.value.length !== 1) {
                        Logging.log('incorrect number of folders returned');
                    }
                    SaverHelper._executeUpload(saverResponse, options, folderId);
                }, function (apiError) {
                    options.error(apiError);
                });
                break;
            case 'aad_picker':
                var folderIds = saverResponse.itemIds;
                if (folderIds.length !== 1) {
                    Logging.log('incorrect number of folders');
                }
                var folderId = folderIds[0];
                if (!folderId) {
                    folderId = 'root';
                }
                SaverHelper._executeUpload(saverResponse, options, folderId);
                break;
            default:
                Logging.log('bad state ' + pickerType);
            }
        };
        SaverHelper.handleSaverError = function (errorResponse, options) {
            if (errorResponse.error === 'access_denied') {
                options.cancel();
            } else {
                options.error(errorResponse);
            }
        };
        SaverHelper._executeUpload = function (saverResponse, options, folderId) {
            var accessToken = saverResponse.accessToken;
            var uploadType = options.uploadType;
            switch (uploadType) {
            case UploadType.dataUrl:
            case UploadType.url:
                SaverHelper._executeUrlUpload(saverResponse, options, folderId, accessToken, uploadType);
                break;
            case UploadType.form:
                SaverHelper._executeFormUpload(saverResponse, options, folderId, accessToken);
                break;
            default:
                Logging.log('bad upload type');
            }
        };
        SaverHelper._executeUrlUpload = function (saverResponse, options, folderId, accessToken, uploadType) {
            var uploadUrl = UrlHelper.appendToPath(saverResponse.apiEndpointUrl, 'drives/' + saverResponse.ownerCid + '/items/' + folderId + '/children');
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
                            errorCode: -1,
                            message: 'foo'
                        });
                    }
                    SaverHelper._beginPolling(options, location_1, accessToken);
                } else {
                    options.error({
                        errorCode: -1,
                        message: 'foo'
                    });
                }
            }, function (xhr, statusCode, timeout) {
                options.error({
                    errorCode: -1,
                    message: 'foo'
                });
            });
        };
        SaverHelper._executeFormUpload = function (saverResponse, options, folderId, accessToken) {
            var uploadSource = options.fileInput;
            var reader = null;
            if (window['File'] && uploadSource instanceof window['File']) {
                reader = new FileReader();
            } else {
                Logging.log('file reader not supported');
            }
            reader.onerror = function (event) {
                options.error({
                    errorCode: -1,
                    message: 'foo' + event.target.error.name
                });
            };
            reader.onload = function (event) {
                var uploadUrl = UrlHelper.appendToPath(saverResponse.apiEndpointUrl, 'drive/items/' + folderId + '/children/' + options.fileName + '/content');
                var queryParameters = {};
                queryParameters['access_token'] = accessToken;
                queryParameters['@name.conflictBehavior'] = 'rename';
                var xhr = new XHR({
                        url: UrlHelper.appendQueryStrings(uploadUrl, queryParameters),
                        clientId: OneDriveState.clientIds.msaClientId,
                        method: Constants.HTTP_POST,
                        apiEndpoint: saverResponse.apiEndpoint
                    });
                var data = event.target.result;
                xhr.upload(data, function (xhr, statusCode) {
                    options.success();
                }, function (xhr, statusCode, timeout) {
                    options.error({
                        errorCode: -1,
                        message: 'foo'
                    });
                }, function (xhr, uploadProgress) {
                    options.progress(uploadProgress.progressPercentage);
                });
            };
            reader.readAsArrayBuffer(uploadSource);
        };
        SaverHelper._beginPolling = function (options, location, accessToken) {
            var pollingInterval = POLLING_INTERVAL;
            var pollCount = POLLING_COUNTER;
            var xhrOptions = {
                    url: UrlHelper.appendQueryString(location, 'access_token', accessToken),
                    method: Constants.HTTP_GET
                };
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
                        options.error({
                            errorCode: -1,
                            message: 'foo'
                        });
                    }
                }, function (xhr, statusCode, timeout) {
                    options.error({
                        errorCode: -1,
                        message: 'foo'
                    });
                });
            };
            CallbackHelper.invokeCallbackAsynchronous(pollForProgress, pollingInterval);
        };
        SaverHelper._createWindowName = function (options) {
            return {
                options: {
                    mode: 'save',
                    success: options.successName,
                    progress: options.progressName,
                    cancel: options.cancelName,
                    error: options.errorName,
                    file: options.file,
                    fileName: options.fileName,
                    uploadType: options.uploadType,
                    openInNewWindow: options.openInNewWindow
                }
            };
        };
        return SaverHelper;
    }();
module.exports = SaverHelper;
},{"../Constants":1,"../OneDriveState":4,"../Popup":5,"../XHR":6,"../models/SaverOptions":10,"../models/UploadType":11,"./AccountChooserHelper":12,"./CallbackHelper":13,"./Logging":17,"./ObjectHelper":18,"./RedirectHelper":20,"./UrlHelper":25,"./VroomHelper":26}],23:[function(_dereq_,module,exports){
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
        StringHelper.equalsCaseInsensitive = function (a, b) {
            if (a && b) {
                return a.toLowerCase() === b.toLowerCase();
            }
            return a === b;
        };
        return StringHelper;
    }();
module.exports = StringHelper;
},{}],24:[function(_dereq_,module,exports){
var ErrorHelper = _dereq_('./ErrorHelper'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), StringHelper = _dereq_('./StringHelper');
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
                    Logging.log('applying default value: ' + defaultValue);
                    return defaultValue;
                } else {
                    ErrorHelper.throwError('object was missing and not optional');
                }
            }
            var objectType = typeof object;
            if (objectType !== expectedType) {
                ErrorHelper.throwError(StringHelper.format('expected object type: \'{0}\', actual object type: \'{1}', expectedType, objectType));
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
            if (functionType !== 'string' && functionType !== 'function') {
                ErrorHelper.throwError(StringHelper.format('expected function type: \'function | string\', actual type: \'{0}\'', functionType));
            }
            var returnFunction = null;
            if (functionType === 'string') {
                var globalFunction = window[functionOption];
                if (typeof globalFunction === 'function') {
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
            for (var i = 0; i < validValues.length; i++) {
                if (object === validValues[i]) {
                    return true;
                }
            }
            return false;
        };
        return TypeValidationHelper;
    }();
module.exports = TypeValidationHelper;
},{"./ErrorHelper":15,"./Logging":17,"./ObjectHelper":18,"./StringHelper":23}],25:[function(_dereq_,module,exports){
var StringHelper = _dereq_('./StringHelper');
var UrlHelper = function () {
        function UrlHelper() {
        }
        UrlHelper.appendToPath = function (baseUrl, path) {
            return baseUrl + (baseUrl.charAt(baseUrl.length - 1) !== '/' ? '/' : '') + path;
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
        UrlHelper.appendQueryString = function (baseUrl, queryKey, queryValue) {
            return UrlHelper.appendQueryStrings(baseUrl, (_a = {}, _a[queryKey] = queryValue, _a));
            var _a;
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
},{"./StringHelper":23}],26:[function(_dereq_,module,exports){
var Constants = _dereq_('../Constants'), Logging = _dereq_('./Logging'), ObjectHelper = _dereq_('./ObjectHelper'), OneDriveState = _dereq_('../OneDriveState'), UrlHelper = _dereq_('./UrlHelper'), XHR = _dereq_('../XHR');
var VroomHelper = function () {
        function VroomHelper() {
        }
        VroomHelper.callVroomOpen = function (response, generateSharingLinks, success, error) {
            VroomHelper._callVroom(response, generateSharingLinks, false, success, error);
        };
        VroomHelper.callVroomSave = function (response, success, error) {
            VroomHelper._callVroom(response, false, true, success, error);
        };
        VroomHelper._callVroom = function (response, generateSharingLinks, isSaver, success, error) {
            var accessToken = response.accessToken;
            var ownerCid = response.ownerCid;
            var itemId = response.itemId;
            var authKey = response.authKey;
            if (!authKey && generateSharingLinks) {
                Logging.log('missing auth key');
            }
            var vroomUrl = Constants.VROOM_URL;
            var queryParameters;
            if (generateSharingLinks) {
                vroomUrl += 'drives/' + ownerCid + '/items/' + itemId;
                queryParameters = {
                    authKey: authKey,
                    expand: 'thumbnails,children(select=id,webUrl,name,size;expand=thumbnails)',
                    select: 'id,webUrl,name,size'
                };
            } else {
                vroomUrl += 'drive/items/' + itemId + '/children';
                queryParameters = { access_token: accessToken };
                if (isSaver) {
                    queryParameters['select'] = 'id';
                } else {
                    queryParameters['expand'] = 'thumbnails';
                    queryParameters['select'] = 'id,@content.downloadUrl,name,size';
                }
            }
            var xhr = new XHR({
                    url: UrlHelper.appendQueryStrings(vroomUrl, queryParameters),
                    clientId: OneDriveState.clientIds.msaClientId,
                    method: Constants.HTTP_GET,
                    apiEndpoint: response.apiEndpoint
                });
            xhr.start(function (xhr, statusCode) {
                success(ObjectHelper.deserializeJSON(xhr.responseText));
            }, function (xhr, statusCode, timeout) {
                error({ error: 'probably comcast\'s fault' });
            });
        };
        return VroomHelper;
    }();
module.exports = VroomHelper;
},{"../Constants":1,"../OneDriveState":4,"../XHR":6,"./Logging":17,"./ObjectHelper":18,"./UrlHelper":25}],27:[function(_dereq_,module,exports){
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
            for (var i = 0; i < values.length; i++) {
                var value = values[i];
                var key = value.key;
                if (windowState[key] !== undefined) {
                    ErrorHelper.throwError(StringHelper.format('window.name object already has a value for key: \'{0}\'', key));
                }
                windowState[key] = value.value;
            }
            var serializedWindowState = ObjectHelper.serializeJSON(windowState);
            Logging.log('window.name = ' + serializedWindowState);
            window.name = serializedWindowState;
        };
        return WindowStateHelper;
    }();
module.exports = WindowStateHelper;
},{"./ErrorHelper":15,"./Logging":17,"./ObjectHelper":18,"./StringHelper":23}]},{},[2])
(2)
});
