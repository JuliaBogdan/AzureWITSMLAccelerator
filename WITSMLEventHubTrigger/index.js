var parseString = require('xml2js').parseString;

module.exports = function (context, eventHubMessages) {
    context.log(`JavaScript eventhub trigger function called for message array ${eventHubMessages}`);
    //context.log('Arguments: ' + arguments);
    var parsedMessages = [];
    eventHubMessages.forEach(message => {
        context.log(message);
      var parsedMessage = parseLog(context, message);
      parsedMessages = parsedMessages.concat(parsedMessage);
      context.log(parsedMessage);
    });
    context.bindings.outputEventHubMessage = parsedMessages;
    context.bindings.outputQueueMessage = parsedMessages;
    context.done();
};

function parseLog(context, message) {
  var dataRows = [];
  var strXML = message.content;
  var mapParams = message.properties;
  parseString(strXML, function (err, xml) {
    var logNode = xml.logs.log[0]
	var indexType = logNode.indexType[0]
	//console.log(indexType)
	var lciArr = logNode.logCurveInfo
    var fields = [];
    for (var i = 0; i < lciArr.length; ++i) {
      fields.push(lciArr[i].mnemonic[0])
    }
	//console.log(fields)
	var dataRowsXML = logNode.logData[0].data
	for (var i = 0; i < dataRowsXML.length; ++i) {
		var dataRow = dataRowsXML[i]
		var splitRow = dataRow.split(',')
		var values = {}
		for (var j = 0; j < splitRow.length; j++){
		  values[fields[j]] = splitRow[j]
		}
		values["store"]=mapParams["store"];
		values["well_id"]=mapParams["well.id"];
		values["wellbore_id"]=mapParams["wellbore.id"];
		values["go_type"]=mapParams["growing.object.type"];
		values["go_id"]=mapParams["growing.object.id"];

    values["time"]=new Date().toISOString();
		//console.log(values);  
		dataRows.push(values);
	  } 
	//console.log(dataRows);
  });  
  return dataRows;  
}