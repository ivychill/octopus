
function BTSSite(lng, lat, raid, cellid)
{
    this.lng=lng;
    this.lat=lat;
    this.raid=raid;
    this.cellid=cellid;
}

function LocationUpdateInfo(time, phonenumber, cellid)
{
    this.time=time;
    this.phonenumber=phonenumber;
    this.cellid=cellid;
    
    this.lng=0.0;
    this.lat=0.0;
    this.raid=0;
}

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
    for (var i=0; i<lineCount; i++)
    {
        var strLine = new String(lines[i]);
        var elments = strLine.split(",");
        if (elments.length == 3)
        {
            elments[2]   =   elments[2].replace(/[\r\n]/g,   "");
            var LUInfo = new LocationUpdateInfo(elments[0],elments[1],elments[2]);
            retArray.push(LUInfo);
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
        //        var btsCount = btsArray.length;
        //        var i=0;
        //        for (i=0; i<btsCount; i++)
        //        {
        //            document.getElementById("Output").innerHTML += "</br>"
        //            +i
        //            +",   "+ btsArray[i].lat
        //            +",   "+ btsArray[i].lng
        //            +",   " + btsArray[i].raid;
        //            var btspoint = new BMap.Point(btsArray[i].lng, btsArray[i].lat);
        //            var btscircle = new BMap.Circle(btspoint,btsArray[i].raid*1000);
        //            btscircle.setFillOpacity(0.1);
        //            map.addOverlay(btscircle);
        //
        //        }
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
                }
            }
        }
    }
    
    reader.readAsText(file);
}




//数据处理模块
SplitDataSegment = function()
{
    if (luArray.length <= 0)
    {
        alert("位置更新数据尚未加载");
    }
    else
    {
        gSegmentArray = splitSegment(luArray);
        alert("segmentCnt="+gSegmentArray.length);
    }
}

//位置更新数据分段
function splitSegment(luInfoArray)
{
    segIndex = 0;
    gSegmentArray.splice(0,0);
    
    var segmentArray = new Array();
    //var elementCnt = 0;
    var tempLuList = new Array();
    
    var rangeAccuracy = document.getElementById("RAccuracy").value;
    
    for (var i=0; i<luInfoArray.length; i++)
    {
        
        if (tempLuList.length > 0)
        {
            var segmentIndex = tempLuList.length - 1;
            var point1 = new BMap.Point(luInfoArray[i].lng, luInfoArray[i].lat);
            var point2 = new BMap.Point(tempLuList[segmentIndex].lng, tempLuList[segmentIndex].lat);
            var distance = map.getDistance(point1, point2);
            var radiusRange = (luInfoArray[i].raid*1.0 + tempLuList[segmentIndex].raid*1.0)*1000.0;
            
            if ( distance > (radiusRange + rangeAccuracy*1000.0))
            {
                segmentArray.push(tempLuList);
                var tempLuList = new Array();
                tempLuList.push(luInfoArray[i]);
            }
            else
            {
                tempLuList.push(luInfoArray[i]);
                
                if (i==(luInfoArray.length-1))
                {
                    segmentArray.push(tempLuList);
                }
            }
        }
        else
        {
            tempLuList.push(luInfoArray[i]);
        }
        
    }
    
    return segmentArray;
    
}

ClearDataFrequency = function()
{
    var cnt = 0;
    for (var i=0; i<gSegmentArray.length; i++)
    {
        var oldArray = gSegmentArray[i];
        var newArray = clear900(oldArray);
        var deletedItemCnt = oldArray.length - newArray.length;
        cnt += deletedItemCnt;
        if (newArray.length != oldArray.length)
        {
            gSegmentArray.splice(i, 1, newArray);
        }
    }
    alert("处理完毕，删除小区个数:"+cnt);
    segIndex = 0;
    NextSegment();
    
}

function clear900(luInfoArray)
{
    
    //var segmentArray = new Array();
    //var elementCnt = 0;
    var tempLuList = new Array();
    
    for (var i=0; i<luInfoArray.length; i++)
    {
        
        if (tempLuList.length > 0)
        {
            var segmentIndex = tempLuList.length - 1;
            var point1 = new BMap.Point(luInfoArray[i].lng, luInfoArray[i].lat);
            var point2 = new BMap.Point(tempLuList[segmentIndex].lng, tempLuList[segmentIndex].lat);
            var distance = map.getDistance(point1, point2);
            
            
            if (luInfoArray[i].raid == 4) //900M?
            {
                //alert("Raid:"+luInfoArray[i].raid);
                
                if ( i>1 && ((luInfoArray.length-i)>1) )
                {
                    var pntPreCell = new BMap.Point(luInfoArray[i-1].lng, luInfoArray[i-1].lat);
                    var pntThisCell = new BMap.Point(luInfoArray[i].lng, luInfoArray[i].lat);
                    var pntNextCell = new BMap.Point(luInfoArray[i+1].lng, luInfoArray[i+1].lat);
                    var RadiusthisCell = luInfoArray[i].raid*1000.0;
                    
                    var Dist1 = map.getDistance(pntPreCell, pntThisCell);
                    var maxDistL1 = Dist1*1 + luInfoArray[i-1].raid;//上一个基站和本基站的距离； 上一个基站覆盖范围是否在本基站范围内
                    //alert("M1:"+maxDistL1 + "R1:"+RadiusthisCell);
                    
                    if (maxDistL1 < RadiusthisCell)
                    {
                        var Dist2 = map.getDistance(pntNextCell, pntThisCell);
                        var maxDistL2 = Dist2*1 + luInfoArray[i+1].raid;//下一个基站和本基站的距离； 下一个基站覆盖范围是否在本基站范围内
                        //alert("M2:"+maxDistL2 + "R1:"+RadiusthisCell);
                        
                        if (maxDistL2 < RadiusthisCell)
                        {
                            //去掉该小区
                            //alert("去掉"+i);
                            
                            continue;
                        }
                    }
                }
            }
            
            tempLuList.push(luInfoArray[i]);
        }
        else
        {
            tempLuList.push(luInfoArray[i]);
        }
        
    }
    
    return tempLuList;
    
}

ClearDataPingpong  = function()
{
    var cnt = 0;
    for (var i=0; i<gSegmentArray.length; i++)
    {
        var oldArray = gSegmentArray[i];
        var newArray = clearPingPong(oldArray);
        var deletedItemCnt = oldArray.length - newArray.length;
        cnt += deletedItemCnt;
        
        if (newArray.length != oldArray.length)
        {
            gSegmentArray.splice(i, 1, newArray);
        }
    }
    
    
    alert("处理完毕，删除小区个数:"+cnt);
    segIndex = 0;
    NextSegment();
    
    
}



function clearPingPong(luInfoArray)
{
    
    var tempLuList = new Array();
    
    //第一轮清洗，来换切换

    for (var i=0; i<luInfoArray.length; i++)
    {
        if ((luInfoArray.length-i) > 2) //后面还有两个
        {
            if ((luInfoArray[i].cellid == luInfoArray[i+1].cellid)
                || (luInfoArray[i].cellid == luInfoArray[i+2].cellid))
            {
                var time1 = new Date(luInfoArray[i].time);
                //var time2 = new Date(luInfoArray[i].time);
                var time3 = new Date(luInfoArray[i+2].time);
                var timediff = Math.abs(time3.getTime() - time1.getTime())/1000;
                
                //如果后面还有切换，并且时间很短，跳过;
                if (timediff < 60)
                {
                    continue;
                }
                
            }
        }
        tempLuList.push(luInfoArray[i]);
    }
    
    return tempLuList;
    //第二轮清洗，频繁切换

//    var ran2List = new Array();
//
//    for (var i=0; i<tempLuList.length; i++)
//    {
//        if ((i > 0) && (tempLuList.length-i) > 1) //后面还有两个
//        {
//            var time1 = new Date(tempLuList[i].time);
//            var time2 = new Date(tempLuList[i+1].time);
//            var timediff = Math.abs(time2.getTime() - time1.getTime())/1000;
//            
//            //如果后面还有切换，并且时间很短，跳过;
//            if (timediff < 30)
//            {
//                continue;
//            }
//            
//        }
//        ran2List.push(tempLuList[i]);
//    }
//    
//    
//
//    
//    return ran2List;
    
}


ClearDataSignal  = function()
{
    var cnt = 0;
    for (var i=0; i<gSegmentArray.length; i++)
    {
        var oldArray = gSegmentArray[i];
        var newArray = clearSignal(oldArray);
        var deletedItemCnt = oldArray.length - newArray.length;
        cnt += deletedItemCnt;
        
        if (newArray.length != oldArray.length)
        {
            gSegmentArray.splice(i, 1, newArray);
        }
    }
    
    
    alert("处理完毕，删除小区个数:"+cnt);
    segIndex = 0;
    NextSegment();
    
    
}

function clearSignal(tempLuList)
{
    var ran2List = new Array();
    
    for (var i=0; i<tempLuList.length; i++)
    {
        if ((i > 0) && (tempLuList.length-i) > 1) //后面还有两个
        {
            var time1 = new Date(tempLuList[i].time);
            var time2 = new Date(tempLuList[i+1].time);
            var timediff = Math.abs(time2.getTime() - time1.getTime())/1000;
            
            //如果后面还有切换，并且时间很短，跳过;
            if (timediff < 30)
            {
                continue;
            }
            
        }
        ran2List.push(tempLuList[i]);
    }
    
    return ran2List;
}

//Example
//function Car(color,doors)
//{
//    this.color=color;
//    this.doors=doors;
//    this.drivers=new Array("Tom","Jerry");
//    this.showColor = function() {
//        return this.color;
//    }
//}
//
//function testvvt()
//{
//    alert( "dkdkdk");
//}


