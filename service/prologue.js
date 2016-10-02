//...
//... Load the Foundations library and create
//... short-hand references to some of its components.
//...
var Foundations = IMPORTS.foundations;
var DB = Foundations.Data.DB;
var Future = Foundations.Control.Future;
var PalmCall = Foundations.Comms.PalmCall;
var AssertUtils = Foundations.Assert;
// var Err = Foundations.Err;

var URI_DB = "palm://com.palm.db/";
var URI_SERVICE = "palm://in.theresetter.workcontacts.service/";
var URI_CONTACT = "in.theresetter.workcontacts.contact:1";
var URI_TRANSPORT = "in.theresetter.workcontacts.transport:1";
var URL_ADDRESSFILE = "/media/internal/addresses.json";
