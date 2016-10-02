//***************************************************
// Validate contact username/password 
//***************************************************
var checkCredentialsAssistant = function( future ) {};

checkCredentialsAssistant.prototype.run = function( future )
{
	var args = this.controller.args;  
	future.result = { returnValue: true };
};

//***************************************************
// Capabilites changed notification
//***************************************************
var onCapabilitiesChangedAssistant = function( future ){};

onCapabilitiesChangedAssistant.prototype.run = function( future )
{ 
    var args = this.controller.args; 
    future.result = { returnValue: true };
};

//***************************************************
// Credentials changed notification 
//***************************************************
var onCredentialsChangedAssistant = function( future ){};

onCredentialsChangedAssistant.prototype.run = function( future )
{ 
    var args = this.controller.args; 
    future.result = { returnValue: true };
};

//***************************************************
// Account created notification
//***************************************************
//
// The account has been created. Time to save the credentials contained in the "config" object
// that was emitted from the "checkCredentials" function.
//
var onCreateAssistant = function( future ){};

onCreateAssistant.prototype.run = function( future )
{  
    var args = this.controller.args;
	future.result = { returnValue: true };
};

//***************************************************
// Account deleted notification
//***************************************************
var onDeleteAssistant = function( future ){};

onDeleteAssistant.prototype.run = function( future )
{ 
    //..Create query to delete contacts from our extended kind associated with this account
    var args = this.controller.args;
	var accountId = args.accountId;
	var q ={ "query": { "from": URI_CONTACT, "where":[ { "prop": "accountId", "op": "=", "val": accountId } ] } };
	// var q ={ "query":{ "from":"in.theresetter.workcontacts.contact:1" } };
	
	AssertUtils.requireDefined( accountId, "*** .../onDelete *** accountId is empty. " );
    AssertUtils.assert( false, "*** .../onDelete *** STARTING DELETE. " );
	PalmCall.call( URI_DB, "del", q ).then( function( f )
	{
		if ( f.result.returnValue === true )
		{
			future.result = { returnValue: true };
		}
		else {
			future.result = f.result;
		}
	});
};

//*****************************************************************************
// Capability enabled notification - called when capability enabled or disabled
//*****************************************************************************
var onEnabledAssistant = function(future){};

onEnabledAssistant.prototype.run = function( future )
{  
    var args = this.controller.args;
	var accountId = args.accountId;
	var lastModTime = new Date( 1970, 1, 1 ).getTime();

	AssertUtils.requireDefined( accountId, "*** .../onEnabled *** accountId is empty. " );
	AssertUtils.requireDefined( args.enabled, "*** .../onEnabled *** <args.enabled> not defined. " );
	
	if ( args.enabled === true )
	{
		var syncRec = { "objects":[{ "_kind": URI_TRANSPORT, "accountId": accountId, "lastModTime": lastModTime }]}; 
		PalmCall.call( URI_DB, "put", syncRec ).then( function( f )
		{
			if ( f.result.returnValue === true )
			{
				future.result = { returnValue: true };
			}
			else {
				future.result = f.result;
			}
		});
	}
	else {
		var delRec = { "query":{ "from": URI_TRANSPORT } };
		PalmCall.call( URI_DB, "del", delRec ).then( function( f )
		{
			if ( f.result.returnValue === true )
			{
				future.result = { returnValue: true };
			}
			else {
				future.result = f.result;
			}
		});
	}
};

//***************************************************
// Sync function
//***************************************************
var syncAssistant = function(future){};

syncAssistant.prototype.run = function( future )
{ 
	var fs = IMPORTS.require('fs');
	var path = IMPORTS.require('path');
	
	var args = this.controller.args;
	var accountId = args.accountId;
	var lastSyncTime = new Date().getTime();
	
	AssertUtils.requireDefined( accountId, "*** .../sync *** accountId is empty. " );
	
	if ( path.existsSync( URL_ADDRESSFILE ) )
	{
		PalmCall.call( URI_SERVICE, "onDelete", { "accountId" : accountId } ).then( function( f1 )
		{
			if ( f1.result.returnValue === true )
			{	
				var contactsRecords = fs.readFileSync( URL_ADDRESSFILE, encoding='utf8' );
				
				contactsRecords = contactsRecords.replace( /\n/g, ',' );
				
				contactsRecords = eval( '(' + '[' + contactsRecords + ']' + ')' );
				
				AssertUtils.requireJSONObject( contactsRecords, "*** .../sync *** <contactsRecords> is not a valid JSON object. " );
				
				for ( var i = 0; i < contactsRecords.length; i++ )
				{
					contactsRecords[i].accountId = accountId;
					contactsRecords[i]._kind = URI_CONTACT; 
				}
				
				AssertUtils.assert( false, "*** .../sync *** STARTING SYNC. " );
				
				PalmCall.call( URI_DB, "put", { "objects": contactsRecords } ).then( function( f2 )
				{
					if ( f2.result.returnValue === true )
					{		
						fs.renameSync( URL_ADDRESSFILE, URL_ADDRESSFILE + "." + lastSyncTime ); // move file so as not to neadlessly sync again
						future.result = { returnValue: true };
					}
					else {
						future.result = f2.result;
					}
				});
			}
			else {
			   future.result = f1.result;
			}
		});
	}
	else {
		AssertUtils.assert( false, "*** .../sync *** /media/internal/addresses.json not found. " );
	}
};