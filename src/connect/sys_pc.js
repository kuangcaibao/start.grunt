/*
 * 固定参数
 */
var ReqPack = [{}];


/*
 * 返回当前时间赋值F_RUNTIME
 */
function getRuntime() {
	var date = new Date();
	var now = "";
	now = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	return now;
}



/*
 * 获取 function 名称
 */
function Fun_Name(funname){
    var tmp = funname.toString();
    var re = /function\s*(\w*)/i;
    var matches = re.exec(tmp);
    //alert("name:" +matches[1]);
    return matches[1];
}



/*
* 回调函数说明：
* callback(_fromid,_funid,_flagtype,_json)
* _formid:来源标记
* _funid:请求功能号
* _flagtype:是否成功标记 pc无需使用
* _json:返回的数据体
*/


/*
 * PC 端调用
 */
function Win_CallTQL(callback_name, funid, _parm, kzcs) {

	window.external.TDX_SENDDATA(callback_name, funid, _parm.Value(), kzcs);

}



/*
 * 定义 IXContent
 */
var IXContent = function() {
	this.ret = "";
	this.retcnt = [];
	this.retlength = 0;
}

IXContent.prototype = {
	Set: function(k, v) {
		if ($.trim(k) == "") {
			alert("当前键对获取为NULL，不予录入，请输入键值对");
			return;
		} else {

			if (typeof(v) == 'string') {
				this.retcnt.push("\"" + k + "\":" + "\"" + v + "\"");
			} else if (typeof(v) == 'number') {
				this.retcnt.push("\"" + k + "\":" + v);
			} else {
				var _cnts = [];
				$.each(v, function(n, m) {
					if (typeof(m) == 'string') {
						_cnts.push("\"" + n + "\":" + "\"" + m + "\"");
					} else {
						_cnts.push("\"" + n + "\":" + m);
					}
				});
				this.retcnt.push("\"" + k + "\":{" + _cnts.join(',') + "}");
			}
			this.retlength++;
		}
	},

	Length: function() {
		return this.retlength;
	},

	Value: function() {
		return "[{" + this.retcnt.join(',') + "}]";
		// this.ret = "{" + this.retcnt.join(',') + "}";
		// return $.parseJSON(this.ret);
	}
}








