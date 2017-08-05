
var fileCount = 0;
var failedCount = 0;
function oneSpriteItem(name, x, y, w, h) {
	this.name = name;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

function makeJSONLine(oneSprite) {
	let str = '"';
	str += oneSprite.name;
	str += '":';
	str += "			";
	str += "{";
	str += '"' + "x" + '":' + oneSprite.x + ',';
	str += '"' + "y" + '":' + oneSprite.y + ',';
	str += '"' + "w" + '":' + oneSprite.w + ',';
	str += '"' + "h" + '":' + oneSprite.h + '}';
	return str;
}

function makeJSONFile(arr) {
	let str = "{\n";
	for (let key = 0; key < arr.length; key++) {
		if (key != 0) {
			str += ",\n";
		}
		str += makeJSONLine(new oneSpriteItem(
			arr[key].getAttribute("name"),
			arr[key].getAttribute("x"),
			arr[key].getAttribute("y"),
			arr[key].getAttribute("width"),
			arr[key].getAttribute("height")
		));
	}
	str += "\n}";
	return str;
}


function fileChange(e) {
	
	for (let key=0;key<Object.keys(e.target.files).length;key++) {		
			if (e.target.files[key].type == "text/xml") {
				console.log("isxml");
				try {
					let xmlTree = e.target.files[0];
					let fileName = e.target.files[key].name;
					if (fileName.split(".xml").length > 0) {
						fileName = fileName.split(".xml")[0];
					}
					let reader = new FileReader();
					let xmlText = reader.readAsText(e.target.files[key]);
					reader.onload = function() {
						let xmlObj = $.parseXML(reader.result);
						let xmlList = $(xmlObj).find("SubTexture")

						let jsonObj = makeJSONFile(xmlList);

						var blob = new Blob([jsonObj], {
							type: "application/json"
						});

						fileBlobs.push({name:fileName,data: blob});

						var url = URL.createObjectURL(blob);	
						var a = document.createElement('a');
						a.download = fileName + ".json";
						a.className = "downloadClick btn btn-default";
						a.href = url;
						a.id = "dowloadZIP";
						a.innerHTML = createGlyphicon("download")+" Download "+ fileName   + ".json";
						$("#download").append(a);
						fileCount++;
						updateNotifications();
					}
				} catch (e) {
					console.log(e);
					
				}
			}
			else {
				console.log("isnotxml");
				failedCount++;
			}
	}
				
					createAZipFromBlobs();
			
}
var theZip = null;
var fileBlobs=[];
var displCount;
var displFailed;
function updateNotifications() {
	if (displCount!=fileCount) {
		displCount=fileCount;
		if (fileCount>0) {
			$("#success").parent().css("display","block");
		}
		document.getElementById("success").innerHTML=fileCount;
	}
	if (displFailed != failedCount) {
		displFailed=failedCount;
		if (failedCount>0) {
			$("#failed").parent().css("display","block");
		}
		document.getElementById("failed").innerHTML=failedCount;
	}
}
function createGlyphicon(type) {
	return "<span class='glyphicon glyphicon-"+type+"'></span>";
}

function createAZipFromBlobs() {
	model.setCreationMethod("Blob");

        // Add the files to the zip
        model.addFiles(fileBlobs, 
            function() {
                // Initialise Method
                console.log("Initialise");
            }, function(file) {
                // OnAdd
                console.log("Added file");
            }, function(current, total) {
                // OnProgress
                console.log("%s %s", current, total);
            }, function() {
                // OnEnd
                // The zip is ready prepare download link
                // <a id="downloadLink" href="blob:url">Download Zip</a>
                model.getBlobURL(function(url) {
                    //document.getElementById("downloadLink").href = url;
                    //document.getElementById("downloadLink").style.display = "block";
                    //document.getElementById("downloadLink").download = "filename.zip";
                    	//var url = URL.createObjectURL(a);	
						var a = document.createElement('a');
						a.download = "XmlToJsonBatch" + ".zip";
						a.className = "downloadClick btn btn-default";
						a.href = url;
						a.id = "dowloadZIP";
						a.innerHTML = createGlyphicon("download")+" Download " + "All" + ".zip";
						$("#download").append(a);
						//a.click();
					
                });
            });
}
var obj = this;
var model = (function() {
    var zipFileEntry, zipWriter, writer, creationMethod, URL = obj.webkitURL || obj.mozURL || obj.URL;

    return {
        setCreationMethod : function(method) {
            creationMethod = method;
        },
        addFiles : function addFiles(files, oninit, onadd, onprogress, onend) {
            var addIndex = 0;

            function nextFile() {
                var file = files[addIndex];
                onadd(file);
                // Modified here to use the Data64URIReader instead of BlobReader
                zipWriter.add(file.name+".json", new zip.BlobReader(file.data), function() {
                    addIndex++;
                    if (addIndex < files.length)
                        nextFile();
                    else
                        onend();
                }, onprogress);
            }

            function createZipWriter() {
                zip.createWriter(writer, function(writer) {
                    zipWriter = writer;
                    oninit();
                    nextFile();
                }, onerror);
            }

            if (zipWriter)
                nextFile();
            else if (creationMethod == "Blob") {
                writer = new zip.BlobWriter();
                createZipWriter();
            } else {
                createTempFile(function(fileEntry) {
                    zipFileEntry = fileEntry;
                    writer = new zip.FileWriter(zipFileEntry);
                    createZipWriter();
                });
            }
        },
        getBlobURL : function(callback) {
            zipWriter.close(function(blob) {
                var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
                callback(blobURL);
                zipWriter = null;
            });
        },
        getBlob : function(callback) {
            zipWriter.close(callback);
        }
    };
})();
function onerror(message) {
  console.error(message);
}


function oninit() {
	console.log(123);
}

function nextFile() {
	console.log("nextFile");
}
function clearFiles() {
	fileBlobs=[];
}
