function tinyPOST(url, data, callback) {
 tinyxhr(url, data, callback, 'POST');
}

function tinyGET(url, callback) {
 tinyxhr(url, null, callback);
}

function tinyxhr(url,data,callback,method,contenttype,timeout) {
  var requestTimeout, xhr;

  try { xhr = new XMLHttpRequest(); } catch(e) {
    try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); }
    catch (e) { return null; }
  }

  requestTimeout = setTimeout(
    function() {
      xhr.abort();
      callback(new Error("tinyxhr: aborted by a timeout"), "", xhr);
    },
    timeout || 5000
  );

  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;
    clearTimeout(requestTimeout);
    var response = xhr.responseText
    try { response = JSON.parse( response ); } catch( e ) {}
    callback( response, (xhr.status != 200 ? new Error("tinyxhr: server respnse status is "+xhr.status) : false), xhr );
  }
  xhr.open( method ? method.toUpperCase() : "GET", url, true);

  function serialize(obj) {
    var str = [];
    for(var p in obj)
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
  }

  if(! data ) { xhr.send();
  } else {
    if( typeof data == 'object' ) data = serialize(data);
    xhr.setRequestHeader('Content-type', contenttype ? contenttype : 'application/x-www-form-urlencoded');
      xhr.send(data)
  }

}
