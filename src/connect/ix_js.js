/*

协议转换  IX--JS

*/

var dictEncode = {
    '\\': '\\',
    '|': 's',
    '\x00': '0',
    '\x01': '1',
    '\x02': '2',
    '\x03': '3',
    '\x04': '4',
    '\x05': '5',
    '\x06': '6',
    '\x07': '7',
    '\x08': '8',
    '\x09': 't',
    '\x0A': 'n',
    '\x0B': 'b',
    '\x0C': 'c',
    '\x0D': 'r',
    '\x0E': 'e',
    '\x0F': 'f'
};

var dictDecode = {
    '\\': '\\',
    's': '|',
    '0': '\x00',
    '1': '\x01',
    '2': '\x02',
    '3': '\x03',
    '4': '\x04',
    '5': '\x05',
    '6': '\x06',
    '7': '\x07',
    '8': '\x08',
    't': '\x09',
    'n': '\x0A',
    'b': '\x0B',
    'c': '\x0C',
    'r': '\x0D',
    'e': '\x0E',
    'f': '\x0F'
};


function Encode(strValue) {
    if (strValue == null || strValue == "" || strValue == undefined) {
        return "";
    }

    strValue = String(strValue);

    //    alert(strValue + '_' + typeof (strValue));

    var strResult = "";

    for (var c = 0; c < strValue.length; c++) {
        var _c = strValue.charAt(c);
        var r = dictEncode[_c];

        if (r == null || r == "" || r == undefined) {
            strResult += _c;
        } else {
            strResult += '\\' + r;
        }
    }
    return strResult;
}


function Decode(strValue) {
    if (strValue == null || strValue == "" || strValue == undefined) {
        return "";
    }

    var bEscape = false;
    var strResult = "";

    for (var _c = 0; _c < strValue.length; _c++) {
        var c = strValue.charAt(_c);
        if (bEscape) {
            bEscape = false;
            var r = dictDecode[c];
            if (r != null || r != "" || r != undefined) {
                strResult += r;
            } else {
                strResult += c;
            }
        } else if (c == '\\') {
            bEscape = true;
        } else {
            strResult += c;
        }
    }
    return strResult;

}


function ToRequest(listJSON, SPEC, STRUCT, BS) {
    if (listJSON == null || listJSON == "" || listJSON == undefined) {
        return "";
    }

    if (SPEC == null || SPEC == "" || SPEC == undefined || STRUCT == null || STRUCT == "" || STRUCT == undefined) {
        SPEC = 2834;
        STRUCT = 0;
    }

    var strResult = "";

    //解析KEY
    var listKey = [];

    for (var d in listJSON) {
        for (var k in listJSON[d]) {
            if ($.inArray(k, listKey) < 0) {
                listKey.push(k);
            }
        }
    }

    // 填充版本
    strResult = "IX,SPEC=" + SPEC + ",STRUCT=" + STRUCT + "\r\n";
    // 填充Key
    nIndex = 0
    if (BS == "1") {
        for (var k in listKey) {
            strResult += (listKey[k] + '|');
        }
    } else {
        for (var k in listKey) {
            nIndex += 1;
            strResult += (String(nIndex) + ',' + listKey[k] + '|');
        }

    }


    strResult += '\r\n';


    for (var d in listJSON) {

        for (var k in listKey) {
            var _k = listKey[k];

            if (listJSON[d][_k] != null || listJSON[d][_k] != "" || listJSON[d][_k] != undefined) {
                strResult += Encode(listJSON[d][_k]) + '|';
            } else {
                strResult += Encode('') + '|';
            }
        }
        strResult += '\r\n';
    }



    return strResult;
}



function FromAnswer(strIX) {
    if (strIX == null || strIX == "" || strIX == undefined) {
        return null;
    }

    var listRecord = strIX.split("\r\n");
    var nRecordCount = listRecord.length;

    if (nRecordCount < 1) {
        return null;
    }

    listRecord.splice(listRecord.length - 1, 1);
    nRecordCount -= 1;


    if (nRecordCount > 0 && listRecord[0] != "" && listRecord[0].indexOf("|") < 0) {
        listRecord.splice(0, 1); //清除数组第一位
        nRecordCount -= 1;
    }


    var listResult = [];
    var nRecordIndex = 0;
    var nFieldCount = 0;

    for (var s in listRecord) {
        var listField = [];
        nRecordIndex += 1;
        //头信息
        if (nRecordIndex == 1) {

            var listTemp = listRecord[s].split("|");
            var nTempCount = listTemp.length;

            if (nTempCount > 5) {
                listTemp.splice(listTemp.length - 1, 1);
                nTempCount -= 1;
            }

            for (var v in listTemp) {
                listField.push(Decode(listTemp[v]));
            }
            while (nTempCount < 5) {
                nTempCount += 1;
                listField.push("");
            }
        }
        //字段信息
        else if (nRecordIndex == 2) {
            var listTemp = listRecord[s].split("|");
            var nFieldCount = listTemp.length;

            if (nFieldCount > 0) {
                listTemp.splice(listTemp.length - 1, 1);
                nFieldCount -= 1;
            }
            var listKey = [];
            for (var v in listTemp) {
                var listInfo = Decode(listTemp[v]).split(",");
                var strKey = ""
                if (listInfo.length >= 2) {
                    strKey = listInfo[1];
                    if (strKey == "" || strKey == null || strKey == undefined) {
                        strKey = listInfo[0];
                    }
                    listInfo.splice(1, 1);
                }
                listKey.push(strKey);
                listField.push(listInfo);
            }
            listResult.push(listKey);
        }
        //字段取值
        else {
            var listTemp = listRecord[s].split("|");
            var nTempCount = listTemp.length;

            if (nTempCount > 0) {
                listTemp.splice(listTemp.length - 1, 1);
                nTempCount -= 1;
            }

            for (var v in listTemp) {
                listField.push(Decode(listTemp[v]));
            }

            while (nTempCount < nFieldCount) {
                nTempCount += 1;
                listField.push("");
            }
        }
        listResult.push(listField);
    }

    return listResult;
}


/*2014-03-28
返回的是数组，数组元素是对象
数组第一个元素是头部对象，共5个属性（ErrorCode，ErrorInfo，Num，Cookies，POS）
数组从第二个元素起是记录每条结果记录封装成的对象
数组至少含有1个元素（头部对象）
数组示例：[{ErrorCode:0,ErrorInfo:'',Num:2,Cookies:'',POS:''},{CUST_ID:'学号',CUST_NM:'姓名'},{CUST_ID:'0',CUST_NM:'0'},{CUST_ID:'1',CUST_NM:'2'},{CUST_ID:'10',CUST_NM:'10'},{CUST_ID:'1',CUST_NM:'3'},{CUST_ID:'0',CUST_NM:'0'},{CUST_ID:'75119',CUST_NM:'李雷'},{CUST_ID:'11000',CUST_NM:'韩梅'}]
调用示例    var result = getResultList(IXstr);
            alert(result[7].CUST_NM);//李雷

result[0]：返回成功信息数组
result[1]：列名数组
result[2]：列是否为可显示字段数组
result[3]：表格中对齐方式  （一般后台不提供）
result[4]：表格列长度 （一般后台不提供）
result[5]：表格列数据类型
result[6]：缓存字段标示 （暂不使用）

str:数据
ret_ixbool：返回值是否是ix 协议
*/

function getResultList(str, ret_ixbool) {
    if (ret_ixbool) {
        if (str.indexOf("MsgCode") != -1) { //兼容老协议
            try {
                /*错误信息*/
                var obj = null;
                var resultArray = new Array();
                eval("obj=" + str);
                var head = new Object();
                head.ErrorCode = obj.MsgCode;
                head.ErrorInfo = obj.MsgInfo;
                head.Num = 0;
                head.Cookies = "";
                head.POS = "0";
                resultArray.push(head);
                return resultArray;
            } catch (e) {
                //pass
            }
        }
        var list = FromAnswer(str);
        if (list.length == 0 || list[0].length < 5) {
            return;
        }
        var resultArray = new Array(); //最终返回的结果数组
        var fieldList = list[1]; //字段名数组


        /*结果头部信息*/
        var head = new Object();
        head.ErrorCode = list[0][0];
        head.ErrorInfo = list[0][1];
        head.Num = list[0][2];
        head.Cookies = list[0][3];
        head.POS = list[0][4];
        resultArray.push(head);

        /*每条记录封装成一个Object，放入resultArray*/
        for (var i = 1; i <= head.Num; i++) {
            var object = new Object();
            for (var k = 0; k < fieldList.length; k++) {
                object[fieldList[k].replace(/(^\s*)|(\s*$)/g, "").toUpperCase()] = list[i + 2][k].replace(/(^\s*)|(\s*$)/g, "");
            }
            resultArray.push(object);
        }

        return resultArray;
    } else {
        try {
            str = str.replace(/(\r)/ig, " ");
            str = str.replace(/(\n)/ig, " "); 
            var matdata = $.parseJSON(str); //解析数组
        } catch (e) {
            return;
        }

        if (matdata == null || matdata == undefined) {
            return;
        }


        var resultArray = new Array();
        var head = new Object(); //应答包头信息
        var headone = matdata[0];

        if (headone.length < 5) {
            return;
        }
        var fieldList = matdata[1]; //字段名数组

        //设置应答结果头
        if (isNaN(parseInt(headone[0]))) {
            return;
        }

        head.ErrorCode = parseInt(headone[0]); //整形
        head.ErrorInfo = headone[1];
        head.Num = parseInt(headone[2]); //整形
        head.Cookies = headone[3];
        head.POS = headone[4];

        resultArray.push(head);


        //第2行 列头解析
        var config_list = matdata[2];

        if (config_list.length >= 0) {

            var filname_obj = new Object();
            var filhid_obj = new Object();
            var filali_obj = new Object();
            var filwid_obj = new Object();
            var fildtype_obj = new Object();
            var filcache_obj = new Object();

            for (var m = 0; m < config_list.length; m++) {
                var _key1 = config_list[m][1];
                var _value1 = config_list[m][2];
                var _value2 = config_list[m][6];
                var _value3 = config_list[m][4];
                var _value4 = config_list[m][5];
                var _value5 = config_list[m][3];
                var _value6 = config_list[m][7];

                filname_obj[_key1] = _value1;
                filhid_obj[_key1] = _value2;
                filali_obj[_key1] = _value3;
                filwid_obj[_key1] = _value4;
                fildtype_obj[_key1] = _value5;
                filcache_obj[_key1] = _value6;
            }
            resultArray.push(filname_obj);
            resultArray.push(filhid_obj);
            resultArray.push(filali_obj);
            resultArray.push(filwid_obj);
            resultArray.push(fildtype_obj);
            resultArray.push(filcache_obj);
        }


        //填充数组
        for (var i = 1; i <= head.Num; i++) {
            var object = new Object();
            var list = matdata[i + 2]; //数据是从第四行开始的
            for (var k = 0; k < fieldList.length; k++) {
                var key = fieldList[k];
                var value = list[k];
                object[key] = value;
            }
            resultArray.push(object);
        }

        return resultArray;

    }

}

/*
* 转换IX的解析出来的数组
* json: 返回的IX数据
* type: 1-easyui
*/
function FormatResult(json,type){
    var data={};
    var list=getResultList(json,false); 
    data["ErrorCode"]=list[0].ErrorCode;
    data["ErrorInfo"]=list[0].ErrorInfo;    
    data["POS"]=list[0].POS;
    
    var config={};
    if(list.length>6){
        config["FieldName"]=list[1];
        config["HideFlag"]=list[2];
        config["Align"]=list[3];
        config["Width"]=list[4];
        config["DataType"]=list[5];
        config["CatheFlag"]=list[6];
    }

    if(type=="1"){
        
        var rows=[];
        if(list.length>7){
            for(var i=7;i<list.length;i++){
                if(i==7){
                    var keys={};
                    for(var key in list[i]){
                        keys[key]=key;
                    }
                    config["FieldKey"]=keys;
                }
                rows[rows.length]=list[i];
            }
        }
        data["total"]=rows.length;
        data["rows"]=rows;
        
    }

    data["config"]=config;
    
    return data;
}