'use strict'
var output = document.getElementById('output'),
    input = document.getElementById('input');
var data, str = '';

input.onblur = function () {
    data = str = '';
    var content = this.value;
    data = content.split(/\n/);
    for(var i in data){
        if (data[i])
            if (data[i].length === 9) data[i] = "0"+data[i];
            str = str + "'" + data[i] +"',\n";
    }
    output.value = str.slice(0, str.length-2);
};

output.onclick = function () {
    this.select();
    document.execCommand('Copy');
    var tips = document.getElementById('tips');
    tips.style.animation = 'tip_anim 2s';
    tips.style.webkitAnimation = 'tip_anim 2s';
    setTimeout(function(){
        tips.style.animation = '';
        tips.style.webkitAnimation = '';
    },2000);
};

(function () {
    var noSend = document.getElementById("noSend"),
        item = document.getElementById("item"),
        noAndItem = document.getElementById("noAndItem"),
        item5 = document.getElementById("item5"),
        noSend5 = document.getElementById('noSend5'),
        editor = document.getElementById("editor"),
        editorBox = document.getElementById("editorBox"),
        act  = document.getElementById("act"),
        clean = document.getElementById('clean');
    
    noSend.onclick = function () {
        output.value = list.noSend + str.slice(0,str.length-2) + "\n)";
    };

    item.onclick = function () {
        output.value = list.item + str.slice(0,str.length-2) + "\n)";
    };

    noAndItem.onclick = function () {
        output.value = list.noSend + str.slice(0,str.length-2) + "\n)\n"+
            list.item + str.slice(0,str.length-2) + "\n)";
    };

    item5.onclick = function () {
        output.value = list.item5 + str.slice(0,str.length-2) + "\n)";
    };
    
    noSend5.onclick = function () {
        output.value = list.noSend5 + str.slice(0,str.length-2) + "\n)";
    };

    editor.onclick = function () {
        if (!editorBox.style.height || editorBox.style.height === '0px') {
            editorBox.style.height = '230px';
        }else {
            editorBox.style.height = '0';
        }
        editorBox.style.transition = 'height .5s';
    };

    act.onclick = function () {
        var inputArr = document.getElementsByTagName("input"),
            checkedArr = [];
        for (var i in inputArr){
            if(inputArr[i].checked){
                checkedArr[checkedArr.length] = inputArr[i].value;
            }
        }
        output.value = sqlJoint(str.slice(0, str.length-2), checkedArr);
    };
    clean.onclick = function () {
        input.value = output.value = "";
        data = str = '';
        var arr = document.getElementsByTagName('input');
        for (var i in arr){
            arr[i].checked = false;
        }
    };

})();

var list = {
    noSend : "SELECT *\n" +
        "FROM dbo.PaymentOrderNoSends\n" +
        "WHERE dbo.PaymentOrderNoSends.TransId IN (\n",
    item : "SELECT *\n" +
        "FROM dbo.PaymentOrderItems\n" +
        "WHERE dbo.PaymentOrderItems.TransId IN (\n",
    item5 : "SELECT *\n" +
        "FROM dbo.payment_order_item\n" +
        "WHERE dbo.payment_order_item.qtrans_id in (\n",
    noSend5 : "SELECT *\n" +
        "FROM dbo.payment_order_no_send\n" +
        "WHERE dbo.payment_order_no_send.qtrans_id in (\n",

    //将item数据修正为50状态
    change : "update [CH.BEI].[dbo].[PaymentOrderItems] set InterfaceStatus = 50\n" +
    "WHERE dbo.PaymentOrderItems.TransId IN (\n",
    //数据修正为50失败状态
    c2f : "update [CH.BEI].[dbo].[PaymentOrderItems] set InterfaceStatus = 50\n" +
    ",ErrorBankCode = '88',ErrorErpCode = '88',ErrorCodeDesc = '交易失败',OrderStatus = 'D'\n" +
    "WHERE dbo.PaymentOrderItems.TransId IN (\n",
    //修正为50成功状态
    c2s : "update [CH.BEI].[dbo].[PaymentOrderItems] set InterfaceStatus = 50\n" +
    ",ErrorBankCode = 'XP217',ErrorErpCode = 'XP217',ErrorCodeDesc = '银行交易成功',\n" +
    "BankOrderNo = '1',BankTransStatus = '7',TransStatus = '7',SendStatus = 'S',\n" +
    "BankStatus = 'C',OrderStatus = 'S'\n" +
    "WHERE dbo.PaymentOrderItems.TransId IN (\n",

    //数据回送，从item插入到nosend
    sendBack : "INSERT INTO PaymentOrderNoSends(\n" +
    "[Id],[TransId],[CompanyCode],[PayingBanks],[RecipientBanks],[PaymentAccount],[PaymentUnitName],[RecipientAccount],[RecipientAccountName],[RecipientBankCode],[RecipientBankName],[CompanyId],[PayingBankId],[CurrencyCode],[Money],[StandardMoney],[PaymentBankCode],[PaymentBankNo],[PaymentProvince],\n" +
    "[PaymentAccountCity],[RecipientAccountCountry],[RecipientAccountProvinceCode],[RecipientAccountProvince],[RecipientAccountCity],[BankDistrictCode],[FundType],[Level],[PayingDate],[LoanFlag],[PaymentNo],[Summary],[UseCn],[Postscript],[RecordingRate],[BusinessCode],[RelatedBusinessCode],[AccountingYear],[VoucherType],[VoucherCode],[VoucherItemCode],[AccountCode],[CombiedSummary],\n" +
    "[CombinedPostscript],[CombinedUseCn],[BusiCode],[BusiNo],[ReferenceNo],[Sender],[DataSourceSystem],[DataSourceCode],[MessageId],[MsgCode],[PayType],[Balber],[Sysioflg],[Issamectiy],[ToPersonnel],[ForeignCurrency],[OffshoreRate],[LargeMark],[PayForAnother],[SendDate],[SendTime],[PackageNo],\n" +
    "[PackageSequence],[Change],[InterfaceStatus],[ErrorErpCode],[ErrorBankCode],[ErrorCodeDesc],[TransCode],[BankRetCode],[BankSerialNum],[BankOrderNo],[BankTransStatus],[TransStatus],[SendStatus],[BankStatus],[OrderStatus],[DetailNo],[CDetailNo],[ErpStatus],[ErpDesc],[TaskGroup],[SourceType],\n" +
    "[DataType],[DataTxT],[ExPackNo],[ExPackageSequence],[TaskNo],[FundArrangeCode],[IsLocked],[InputType],[Remark],[Sequence],[IsFreeze],[Creator],[CreateTime],[Editor],[EditTime],[OldPackageNo],[PaymentCountry],[PaymentBankName],[SwiftCode]\n" +
    ")\n" +
    "SELECT [Id],[TransId],[CompanyCode],[PayingBanks],[RecipientBanks],[PaymentAccount],[PaymentUnitName],[RecipientAccount],[RecipientAccountName],[RecipientBankCode],\n" +
    "[RecipientBankName],[CompanyId],[PayingBankId],[CurrencyCode],[Money],[StandardMoney],[PaymentBankCode],[PaymentBankNo],[PaymentProvince],[PaymentAccountCity],[RecipientAccountCountry],[RecipientAccountProvinceCode],[RecipientAccountProvince],[RecipientAccountCity],\n" +
    "[BankDistrictCode],[FundType],[Level],[PayingDate],[LoanFlag],[PaymentNo],[Summary],[UseCn],[Postscript],[RecordingRate],[BusinessCode],[RelatedBusinessCode],[AccountingYear],[VoucherType],[VoucherCode],[VoucherItemCode],[AccountCode],[CombiedSummary],[CombinedPostscript],\n" +
    "[CombinedUseCn],[BusiCode],[BusiNo],[ReferenceNo],[Sender],[DataSourceSystem],[DataSourceCode],[MessageId],[MsgCode],[PayType],[Balber],[Sysioflg],[Issamectiy],[ToPersonnel],[ForeignCurrency],[OffshoreRate],[LargeMark],[PayForAnother],[SendDate],[SendTime],[PackageNo],[PackageSequence],\n" +
    "[Change],[InterfaceStatus],[ErrorErpCode],[ErrorBankCode],[ErrorCodeDesc],[TransCode],[BankRetCode],[BankSerialNum],[BankOrderNo],[BankTransStatus],[TransStatus],[SendStatus],[BankStatus],[OrderStatus],[DetailNo],[CDetailNo],[ErpStatus],[ErpDesc],[TaskGroup],[SourceType],\n" +
    "[DataType],[DataTxT],[ExPackNo],[ExPackageSequence],[TaskNo],[FundArrangeCode],[IsLocked],[InputType],[Remark],[Sequence],[IsFreeze],[Creator],[CreateTime],[Editor],[EditTime],[OldPackageNo],[PaymentCountry],[PaymentBankName],[SwiftCode]\n" +
    " FROM PaymentOrderItems\n" +
    " where PaymentOrderItems.TransId IN( \n",
    //删除nosend中的数据
    del : "DELETE FROM PaymentOrderNoSends\n" +
    " WHERE dbo.PaymentOrderNoSends.TransId IN (\n",

    //5.0修改成失败
    c2f5 : "update  [QAS.FSP.BEI].[dbo].[payment_order_item] set \n" +
        "qinterface_status = 80, qorder_status = 'D',\n" +
        "qerror_code_desc = '交易失败', qerror_code_txt = '交易失败'\n" +
        "where qtrans_id IN(\n",
    c2s5 : "update  [QAS.FSP.BEI].[dbo].[payment_order_item] set \n" +
        "qinterface_status = 90, qorder_status = 'S', qerror_bank_code = 'XP217',\n" +
        "qerror_code_desc = '银行交易成功', qerror_code_txt = '银行交易成功', qerror_erp_code = 'XP217'\n" +
        "where qtrans_id IN(\n",
};

function sqlJoint() {
    var sql = "", s = arguments[0], arr = arguments[1];
    for(var i in arr){
        if (arr[i] === 'sendBack')
            sql = sql + list.del + s +")\n\n";
        sql = sql + list[arr[i]] + s +")\n\n";
    }
    return sql
}