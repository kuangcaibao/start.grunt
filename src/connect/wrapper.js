/**
 *  通讯封装
 */ 
var CallTQL = function(sts) {
	this.sts = $.extend({}, sts);
	this.funcnum = 0;
}

/**
 * 发送请求封装函数
 * @params {String} funcid 请求功能号
 * @params {Json} ixs 输入参数
 * @params {Number} type 需要返回的类型 0 - 返回原始数据  1 - 返回处理后的数据  默认为 1
 * @params {Function} callback 回调函数 入参为返回原数据或者处理后的数据
 */ 
CallTQL.prototype.sendRequest = function(funcid, ixs, type, callback) {
	
	if (callback == undefined) callback = type;
	type = type == 0 ? 0 : 1;
	ixs = ixs || {};
	funcid = funcid || "";

	var fc = window.location.href.search("fc_client") >= 0 ;
	var retfunc = "retfunc" + (this.funcnum++);
	window[retfunc] = function(_fromid, _funid, _flagtype, json) {
		try {

			// if (fc) json = _fromid;
			json = _fromid

			json = json.replace(/\r\n/g, "<br>");
			json = json.replace(/\s/g, "");

			if (type == 0) {
				callback(json);
				window[retfunc] = null;
				return;
			}

			var data = FormatResult(json, 1);
			if (data.ErrorCode == 0) {
				callback(data);
			} else {
				var msg = data.ErrorInfo || ( "发送 " + _funid + " 出错" );
				if(fc) {
					alert(msg);
					callback({});
				} else {

					$.messager.alert("提示", msg, "error", function() {
						callback({});
					});
				}
			}
		} catch(e) {
			if (fc) {
				alert("[JSON数据解析失败]")
				console.log(json);
				callback({});
			} else {
				
				$.messager.alert("提示", "[JSON数据解析失败]", "error");
			}
		}
		window[retfunc] = null;
	}

	// 这里添加 PB客户端 chrome 调用修改
	var onSuccess = function(response) {
		response = response.replace(/\r\n/g, "<br>");
		response = response.replace(/\s/g, "");
		if(type == 0) {
			callback(response);
			return;
		}

        try {
            
    		data = FormatResult(response, 1);
    		if(data.ErrorCode == 0) {
    			callback(data)
    		} else {
    			alert(data.ErrorInfo);
    			callback({});
    		}
        } catch(e) {
            alert(e)
        }
	}

	// debugger;
	var ii = {};
	$.extend(ii, this.sts, ixs);
	var _ix = new IXContent();
	$.each(ii, function(key, value) {
		_ix.Set(key, value || "");
	});


	if (fc) {
		var ftype = ii.ftype || "AMS";
		funcid = ftype + ":" + funcid;
		console.log(funcid);
		console.log(JSON.stringify([ii]));
		// console.log(_ix.Value());
		// window.external.CallTQL(retfunc, funcid, _ix.Value());
		window.external.CallTQL(retfunc, funcid, JSON.stringify([ii]));
	} else {
		// Win_CallTQL(retfunc, funcid, _ix, "");
		var req = {
			Method: "CallTQL",
			FuncName: funcid,
			Param: "CTPMORE_"+_ix.Value()
		}

		window.TDXQuery({
			request: JSON.stringify(req),
			onSuccess: onSuccess,
			onFailure: function(errCode, errInfo) {
				alert(errInfo);
			}
		})
	}
}