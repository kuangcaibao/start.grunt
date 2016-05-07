(function($) {

var TdxGrid = function(el, opts) {
	this.opts = opts;
	this.$el = el;
	this.rnd = "col" + (parseInt(Math.random() * 100000)).toString(16);
	this.colclass = [];

	this._initLayout($(el));
	this._initHead();
	this._setColStyle();
	this._initEvent();
	this._setTableHeight();
};

TdxGrid.prototype._initLayout = function($el) {
	var tdxgrid = [
		'<div class="tdxgrid">',
			'<style></style>',
			'<div class="tdxgrid-headerwrapper">',
				'<table class="tdxgrid-header" cellspacing="0"></table>',
			'</div>',
			'<div class="tdxgrid-bodywrapper">',
				'<table class="tdxgrid-body" cellspacing="0"></table>',
			'</div>',
		'</div>'
	];

	$el.html(tdxgrid.join(""));

	this.$grid = this.$el.find(".tdxgrid");
	this.$header = this.$el.find(".tdxgrid-header");
	this.$body = this.$el.find(".tdxgrid-body");
	this.$style = this.$el.find("style");
};

TdxGrid.prototype._initHead = function() {
	var cols = this.opts.cols;
	var depth = 1;  // 表格表头深度

	// 获得表格表头深度
	for(var i = 0; i < cols.length; i++) {
		var o = cols[i];
		if (o.cols !== undefined) {
			depth = 2;
			break;
		}
	}

	var colindex =0;

	// 生成表头信息
	var thstr1 = "<tr>";
	var thstr2 = "<tr>";
	for(i = 0; i < cols.length; i++) {
		var ol = cols[i];
		var wd;
		if (ol.cols !== undefined) {
			thstr1 += "<th colspan='"+ol.cols.length+"'>";
			thstr1 +=   ol.title;
			thstr1 += "</th>";
			for(var j = 0; j < ol.cols.length; j++) {
				var oll = ol.cols[j];
				wd = oll.width || $.fn.tdxgrid.defaults.width;
				thstr2 += "<th colindex='"+colindex+"' class='"+(this.rnd +"_"+ colindex)+"'>";
				thstr2 += "<div class='tdxgrid-titlewrapper'>";
				thstr2 += 	"<span class='tdxgrid-title' field='"+oll.field+"'>" + oll.title + "</span>";
				thstr2 += 	"<div class='tdxgrid-sort'></div>";
				thstr2 +=	"<div class='tdxgrid-colresize'></div>";
				thstr2 += "</div>";
				thstr2 += "</th>";
				colindex++;
			}

		} else {
			wd = ol.width || $.fn.tdxgrid.defaults.width;
			thstr1 += "<th rowspan='"+depth+"' colindex='"+colindex+"' class='"+(this.rnd +"_"+ colindex)+"'>";
			thstr1 += "<div class='tdxgrid-titlewrapper'>";
			thstr1 += 	"<span class='tdxgrid-title' field='"+ol.field+"'>" + ol.title + "</span>";
			thstr1 += 	"<div class='tdxgrid-sort'></div>";
			thstr1 +=	"<div class='tdxgrid-colresize'></div>";
			thstr1 += "</div>";
			thstr1 += "</th>";
			colindex ++;
		}
	}

	thstr1 += "</tr>";
	thstr2 += "</tr>";

	// this.$el.empty();
	this.$header.html(thstr1 + thstr2);
};

TdxGrid.prototype.loaddata = function(rows) {

	this.rows = rows;

	var opts = this.opts;
	var $body = this.$body;
	var rnd = this.rnd;
	var len = this.colclass.length;
	
	var cols = opts.cols;
	$body.empty();

	var tdno = "<tr>";
	if (rows === undefined || rows.length === 0) {
		tdno += "<td colspan='"+len+"' style='border:0;'>";
		tdno += "没有相应的查询信息!</td>";
		tdno += "</tr>";
		$body.append(tdno);
		return;
	}

	for(var k = 0; k < rows.length; k++) {
		var tdstr1 = "<tr>";
		var rowdata = rows[k];
		var colindex = 0;
		for(var i = 0; i < cols.length; i++)　{
			var ol = cols[i];
			var v;
			var t;
			if (ol.cols) {
				for(var j = 0; j < ol.cols.length; j++) {
					var oll = ol.cols[j];
					// tdstr1 += rowdata[oll.field];
					// 这里修改,以支持配置中的formatter
					v = rowdata[oll.field];
					if (oll.formatter) {
						v = oll.formatter(v);
					}
					t = v;
					if (v && v.toString().indexOf("span") >= 0) {
						t = rowdata[oll.field];
					};
					tdstr1 += "<td class='"+(rnd+"_"+colindex)+"' title='"+t+"'>";
					tdstr1 += v;
					tdstr1 += "</td>";
					colindex++;
				}
			} else {
				// tdstr1 += rowdata[ol.field];
				v = rowdata[ol.field];
				if (ol.formatter) {
					v = ol.formatter(v);
				}
				t = v;
				if (v && v.toString().indexOf("span") >= 0) {
					t = rowdata[ol.field]
				};
				tdstr1 += "<td class='"+(rnd+"_"+colindex)+"' title='"+t+"'>";
				tdstr1 += v;
				tdstr1 += "</td>";
				colindex++;
			}
		}
		tdstr1 += "</tr>";
		$body.append(tdstr1);
	}

};

TdxGrid.prototype._setColStyle = function() {
	var opts = this.opts;
	var cols = opts.cols;
	var colindex =0;
	var stylestr = "";

	var align;
	var width;
	var hidden;

	this.colclass = [];
	for(var i = 0; i < cols.length; i++) {
		var ol = cols[i];
		if (ol.cols) {
			for(var j = 0; j < ol.cols.length; j++) {
				var oll = ol.cols[j];
				align = oll.align || $.fn.tdxgrid.defaults.align;
				width = oll.width || $.fn.tdxgrid.defaults.width;
				hidden = oll.hidden === true ? "none" : "";
				this.colclass.push(this.formstylestr(colindex, align, width, hidden));
				colindex++;
			}

		} else {
			align = ol.align || $.fn.tdxgrid.defaults.align;
			width = ol.width || $.fn.tdxgrid.defaults.width;
			hidden = ol.hidden === true ? "none" : "";
			this.colclass.push(this.formstylestr(colindex, align, width));
			colindex ++;
		}
	}

	this.activeColStyle();
};

TdxGrid.prototype.formstylestr = function(colindex, align, width, hidden) {
	return [
		".tdxgrid ." + this.rnd + "_" + colindex + "{ ",
		"text-align: " + align + ";",
		"width: " + width + "px;",
		"min-width: " + width + "px;",
		"max-width: " + width + "px;",
		"display: " +  hidden + ";",
		"}"
	];
};

TdxGrid.prototype.activeColStyle = function() {
	try {
		this.$style.text(this.formstyle());
	} catch(e) {
		this.$style[0].styleSheet.cssText = this.formstyle();
	}
};

TdxGrid.prototype.formstyle = function() {
	var s = this.colclass;
	var stylestr = "";
	for(var i = 0; i < s.length; i++) {
		stylestr += s[i].join("");
	}
	return stylestr;
};

TdxGrid.prototype._initEvent = function() {
	var $header = this.$header;
	var $grid = this.$grid;
	var $cls = this.colclass;
	var that = this;
	var $bodywrapper = $(this.$el).find(".tdxgrid-bodywrapper");
	var $headerwrapper = $(this.$el).find(".tdxgrid-headerwrapper");

	// 滚动事件
	$bodywrapper.on("scroll", function() {
		$headerwrapper.css('left',- $(this).scrollLeft());
	});

	// 调整列宽
	$header.on("mousedown", ".tdxgrid-colresize", function(e) {
		var start = e.pageX;
		var colindex = $(this).parent().parent().attr("colindex");
		var wd = $(this).parent().parent().width();

		$grid.on("mousemove", function(e) {
			wd = wd + e.pageX - start;
			start = e.pageX;
			wd = wd < 10 ? 10 : wd;
			$cls[colindex][2] = "width: " + wd + "px;";
			$cls[colindex][3] = "min-width: " + wd + "px;";
			$cls[colindex][4] = "max-width: " + wd + "px;";
			that.activeColStyle();
		}).on("mouseup", function(e) {
			$grid.mouseleave();
		}).on("mouseleave", function(e) {
			$grid.off("mouseup").off("mouseleave").off("mousemove");
		});
	});

	// 排序
	$header.on("click", ".tdxgrid-title", function(e) {
		var field = $(this).attr("field");
		var sibsort = $(this).siblings().eq(0);
		if (sibsort.hasClass("sort-desc")) {
			sibsort.removeClass("sort-desc");
			sibsort.addClass("sort-asc");
			that.sort(field, 0); // 0 升序排序
		} else if (sibsort.hasClass("sort-asc")) {
			sibsort.removeClass("sort-asc");
			sibsort.addClass("sort-desc");
			that.sort(field, 1); // 1 降序排序
		} else {
			that.$el.find(".tdxgrid-sort").removeClass("sort-asc");
			that.$el.find(".tdxgrid-sort").removeClass("sort-desc");
			sibsort.addClass("sort-desc");
			that.sort(field, 1);
		}
	});
};

TdxGrid.prototype.sort = function(field, type) {
	var rows = this.rows;

	// 判断该字段以数字排序还是字符排序
	// 数字比较处理
	// 判断该字符串是否为数字

	var reg = new RegExp(/^-?[0-9.]*$/);
	var ff = 1; // 数字比较
	for(var i = 0; i < rows.length; i++) {
		var tmp = rows[i][field].toString();
		if (!reg.test(tmp)) {
			ff = 0;
			break;
		}
	}

	// var va = rows[0][field].toString();
	// var vb = rows[1][field].toString();
	// if (reg.test(va) && reg.test(vb)) ff = 1; // 数字比较

	rows = rows.sort(function(a, b) {

		va = a[field];
		vb = b[field];

		if (ff == 1) {
			va = parseFloat(a[field]);
			vb = parseFloat(b[field]); 
		}

		// 升序
		if (type === 0) {
			return va > vb ? 1 : -1;
		} else {
			return vb > va ? 1 : -1;
		}
	});

	this.loaddata(rows);
};

TdxGrid.prototype._setTableHeight = function() {
	// 设置2个表格的高度,适应外框高度
	// debugger;
	this.$el.find(".tdxgrid-headerwrapper").width(9999);
	var tht = this.$el.height();
	var hht = this.$el.find(".tdxgrid-headerwrapper").height();
	var ht = tht - hht;
	ht = ht < 200 ? 200 : ht;
	this.$el.find(".tdxgrid-bodywrapper").css({
		"height": ht,
	});

	// 设置宽度
	// this.$grid.css({
	// 	"width": this.$header.width() + 20
	// });
};

$.fn.tdxgrid = function() {

	if (arguments.length > 0 && typeof arguments[0] === 'object') {
		var option = arguments[0];
		var options = $.extend(true, {}, $.fn.tdxgrid.defaults, option);
		return new TdxGrid(this, options);
	}
};

$.fn.tdxgrid.defaults = {
	width: 80,
	align: "center"
};

})(window.jQuery);