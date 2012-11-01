
function readSiteData(sitedata)
{
    var retArray = new Array();
    var strFile = new String(sitedata);
    
    var lines = strFile.split("\n");
    var lineCount = lines.length;
    for (var i=0; i<lineCount; i++)
    {
        //document.getElementById("Output").innerHTML += "</br>"+lines[i];
        var strLine = new String(lines[i]);
        var elments = strLine.split(",");
        if (elments.length == 4)
        {
            elments[3]   =   elments[3].replace(/[\r\n]/g,   "");
            var btsInfo = new BTSSite(elments[0],elments[1],elments[2],elments[3]);
            retArray.push(btsInfo);
            //document.getElementById("Output").innerHTML += "</br>" + btsInfo.lat +":"+ btsInfo.lng +":" + btsInfo.raid;
        }
    }
    
    return retArray;
}

function readLocationUpdateData(data)
{
    var retArray = new Array();
    var strFile = new String(data);
    
    var lines = strFile.split("\n");
    var lineCount = lines.length;
    var validLineCnt = 0;
    for (var i=0; i<lineCount; i++)
    {
        var strLine = new String(lines[i]);
        var elments = strLine.split(",");
        if (elments.length == 3)
        {
            elments[2]   =   elments[2].replace(/[\r\n]/g,   "");
            var LUInfo = new LocationUpdateInfo(elments[0],elments[1],elments[2]);
            LUInfo.switchIndex = validLineCnt;
            validLineCnt++;
            retArray.push(LUInfo);
        }
    }
    
    return retArray;
}

function readPathData(data)
{
    var retArray = new Array();
    var strFile = new String(data);
    
    var paths = strFile.split(";");
    
    for (var i=0; i<paths.length; i++)
    {
        var lines = paths[i].split("\n");
        var lineCount = lines.length;
        var PointArray = new Array();

        for (var j=0; j<lineCount; j++)
        {
            var strLine = new String(lines[j]);
            var elments = strLine.split(",");
            if (elments.length == 2)
            {
                elments[1]   =   elments[1].replace(/[\r\n]/g,   "");
                var pathPoint = new BMap.Point(elments[0],elments[1]);
                PointArray.push(pathPoint);
            }
        }
        
        if (PointArray.length > 0)
        {
            retArray.push(PointArray);
        }
  
    }

    return retArray;
}


function handleBTSFileSelect(evt)
{
    var files = evt.target.files; // FileList对象
    var file = files[0];
    var reader = new FileReader();
    
    reader.onload = function()
    {
        btsArray = readSiteData(this.result);
    }
    
    reader.readAsText(file);
    
}

function handleLUFileSelect(evt)
{
    steIndex = 0;//先清空显示步骤
    segIndex = 0;
    
    var files = evt.target.files; // FileList对象
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function()
    {
        map.clearOverlays();
        document.getElementById('Output').innerHTML = "";
        
        luArray = readLocationUpdateData(this.result);
        //var btsCount = luArray.length;
        //var i=0;
        
        for (var i=0; i<luArray.length; i++)
        {
            //var j=0;
            
            for (var j=0; j<btsArray.length;j++)
            {
                
                if (luArray[i].cellid == btsArray[j].cellid)
                {
                    luArray[i].lng = btsArray[j].lng;
                    luArray[i].lat = btsArray[j].lat;
                    luArray[i].raid = btsArray[j].raid;
                    luArray[i].roadNames = btsArray[j].roadNames;
                    luArray[i].roadIndex = btsArray[j].roadIndex;

                    
                    var btspoint = new BMap.Point(btsArray[j].lng, btsArray[j].lat);
                    var btscircle = new BMap.Circle(btspoint,btsArray[j].raid*1000);
                    btscircle.setFillOpacity(0.1);
                    map.addOverlay(btscircle);
                    
                    //var point = new BMap.Point(116.404, 39.915);
                    var marker = new BMap.Marker(btspoint);  // 创建标注
                    map.addOverlay(marker);              // 将标注添加到地图中
                    
                    var label = new BMap.Label(i);//+":"+luArray[i].cellid,{offset:new BMap.Size(-40,-20)});
                    marker.setLabel(label);
                    
                    document.getElementById('Output').innerHTML += "</br>" + i + "\tCELL:"+luArray[i].cellid;
                    
//                    for (var ijj = 0; ijj <luArray[i].roadNames.length; ijj++ )
//                    {
//                        document.getElementById("Output").innerHTML += "<br/>路名:"+luArray[i].roadNames[ijj]+":"+luArray[i].roadIndex[ijj];
//                    }

                }
            }
        }
        
        gSegmentArray.splice(0);
        gSegmentArray.push(luArray);
    }
    
    reader.readAsText(file);
}



function handlePathFileSelect(evt)
{
    //gPathArray
    
    var files = evt.target.files; // FileList对象
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function()
    {
        document.getElementById('Output').innerHTML = "";
        
        gPathArray = readPathData(this.result);
        matchBTSandRoad();
        
//        for (var i=0; i<gPathArray.length; i++)
//        {
//            //var j=0;
//            var poinlist = gPathArray[i];
//            
//            
////            var polyline = new BMap.Polyline(poinlist, {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});
////            map.addOverlay(polyline);
////            
////            document.getElementById('Output').innerHTML += "</br>" + i + "\tPoints:"+gPathArray[i].length;
//
//        }
    }
    
    reader.readAsText(file);
}


function matchBTSandRoad()
{
    for (var i=0; i<btsArray.length;i++)
    {
        var btsInfo = btsArray[i];
        var nearInfo = new DistInfo((new BMap.Point(0,0)), 9999999999, 0, 0);
        for (var j = 0; j < 4; j++)// gPathArray.length; j++)
        {

            var poinlist = gPathArray[j];
            var btspoint = new BMap.Point(btsInfo.lng, btsInfo.lat);
            var retDistInfo = getNearestDistanceOfRoad(btspoint, poinlist);
            //document.getElementById('Output').innerHTML += "</br>" + "j Length:"+gPathArray[j].length;

            //document.getElementById('Output').innerHTML += "</br>" + i + ":"+j+":"+retDistInfo.distance;
            

            if (nearInfo.distance > retDistInfo.distance)
            {
                nearInfo = retDistInfo;//.distance;
            }
            
            
            if (retDistInfo.distance <= btsInfo.raid*1000)
            {
                var btspoint = new BMap.Point(btsInfo.lng, btsInfo.lat);
                var rdName = "Unknow";
                if (j == 0)
                {
                    rdName =  "环城高速东侧";
                }
                if (j == 1)
                {
                     rdName = "环城高速北侧";
                }
                if (j == 2)
                {
                     rdName = "成渝高速";
                }
                if (j == 3)
                {
                     rdName = "机场高速";
                }
                btsInfo.roadNames.push(rdName);
                btsInfo.roadIndex.push(retDistInfo.index); //YSH Warning

                //document.getElementById('Output').innerHTML += "</br>" + rdName+":"+retDistInfo.index;
                
//                if (btsInfo.cellid == "13119-20391")//""13142-40511")
//                {
//                    document.getElementById('Output').innerHTML += "</br>13142-40511: idx="+retDistInfo.index+"prj:" +retDistInfo.projection.lng +","+ retDistInfo.projection.lat+" "+rdName;
//                }

            }
            
        }
        
        
        
        
        
        if (nearInfo.distance > btsInfo.raid*1000)
        {
            var btspoint = new BMap.Point(btsInfo.lng, btsInfo.lat);

            var btscircle = new BMap.Circle(btspoint,btsInfo.raid*1000);
            btscircle.setFillOpacity(0.1);
            map.addOverlay(btscircle);
            var marker = new BMap.Marker(btspoint);  // 创建标注
            map.addOverlay(marker);              // 将标注添加到地图中
            
            //var label = new BMap.Label(i+"/"+nearInfo.index+ "/"+nearInfo.distance ,{offset:new BMap.Size(-40,-20)});
            var label = new BMap.Label(btsInfo.cellid+"/最近道路距离:"+nearInfo.distance ,{offset:new BMap.Size(-40,-20)});
            marker.setLabel(label);
            
            document.getElementById('Output').innerHTML += "</br>所有道路都匹配不上，删除小区:"+btsInfo.cellid;


        }
        
        
    }

}







