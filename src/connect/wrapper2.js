var __funcnum = 0

/**
 *  通讯封装
 */ 
var CallTQL = function(ixs) {
	this.ixs = $.extend({}, ixs);
	// this.funcnum = 0;
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

	var retfunc = "retfunc" + (__funcnum++);

	window[retfunc] = function(_fromid, _funid, _flagtype, json) {
		try {

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

				// 这里应该把错误信息返回了
				// 因为用户可能还会对错误信息进行判断

				$.messager.alert("提示", msg, "error", function() {
					callback(msg);
				});
			}
		} catch(e) {
			$.messager.alert("提示", "[JSON数据解析失败]", "error");
			callback({});
		}
		window[retfunc] = null;
	}

	// debugger;
	var ii = {};
	$.extend(ii, this.ixs, ixs);
	var _ix = new IXContent();
	$.each(ii, function(key, value) {
		_ix.Set(key, value || "");
	});

	// 这里区分协议种类
	// 客户端读trade.ccf的协议  ftype = "" 如  Win_CallTQL("callback", "gettradeccf", ixs, "")
	// tc的交易协议  ftype = "JY"  如  Win_CallTQL("callback", "JY:1122", ixs, "")
	// ts的5010协议  ftype = "5010" 如 Win_CallTQL("5010:CITICS.585450")

	if(ii.ftype && ii.ftype != "") {

		if(ii.ftypemid && ii.ftypemid != "") {
			funcid = ii.ftype + ":" + ii.ftypemid + "." + funcid
		} else {
			funcid = ii.ftype + ":" + funcid
		}
	}

	Win_CallTQL(retfunc, funcid, _ix, "");
}