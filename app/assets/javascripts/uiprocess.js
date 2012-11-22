

ShowAll = function ()
{
    map.clearOverlays();
    for (var i=0; i<luArray.length; i++)
    {
        
        for (var j=0; j<btsArray.length;j++)
        {
            
            if (luArray[i].cellid == btsArray[j].cellid)
            {
                var btspoint = new BMap.Point(btsArray[j].lng, btsArray[j].lat);
                var btscircle = new BMap.Circle(btspoint,btsArray[j].raid*1000);
                btscircle.setFillOpacity(0.2);
                map.addOverlay(btscircle);
                
                var marker = new BMap.Marker(btspoint);  // 创建标注
                map.addOverlay(marker);              // 将标注添加到地图中
                
                var label = new BMap.Label(i);//+":"+luArray[i].cellid,{offset:new BMap.Size(-40,-20)});
                marker.setLabel(label);
                
            }
        }
    }
    
    
}

StepNext = function ()
{
    map.clearOverlays();
    
    if (steIndex >= luArray.length)
    {
        steIndex = 0;
    }
    
    
    for (var j=0; j<btsArray.length;j++)
    {
        
        if (luArray[steIndex].cellid == btsArray[j].cellid)
        {
            var btspoint = new BMap.Point(btsArray[j].lng, btsArray[j].lat);
            var btscircle = new BMap.Circle(btspoint,btsArray[j].raid*1000);
            btscircle.setFillOpacity(0.2);
            map.addOverlay(btscircle);
            
            //var point = new BMap.Point(116.404, 39.915);
            var marker = new BMap.Marker(btspoint);  // 创建标注
            map.addOverlay(marker);              // 将标注添加到地图中
            
            var label = new BMap.Label(steIndex+":"+luArray[steIndex].cellid,{offset:new BMap.Size(-40,-20)});
            marker.setLabel(label);
            
        }
    }
    
    steIndex++;
    
}

StepPre = function ()
{
    map.clearOverlays();
    
    steIndex--;
    if (steIndex <= 0)
    {
        steIndex = luArray.length - 1;
    }
    else
    {
        steIndex--;
    }
    
    
    for (var j=0; j<btsArray.length;j++)
    {
        
        if (luArray[steIndex].cellid == btsArray[j].cellid)
        {
            var btspoint = new BMap.Point(btsArray[j].lng, btsArray[j].lat);
            var btscircle = new BMap.Circle(btspoint,btsArray[j].raid*1000);
            btscircle.setFillOpacity(0.2);
            map.addOverlay(btscircle);
            
            //var point = new BMap.Point(116.404, 39.915);
            var marker = new BMap.Marker(btspoint);  // 创建标注
            map.addOverlay(marker);              // 将标注添加到地图中
            
            var label = new BMap.Label(steIndex+":"+luArray[steIndex].cellid,{offset:new BMap.Size(-40,-20)});
            marker.setLabel(label);
            
        }
    }
    
    steIndex++;
}

function NextSegment()
{
    map.clearOverlays();
    segPntIndex = 0;

    
    if (segIndex >= gTempSegmentArray.length)
    {
        segIndex = 0;
    }
    
    var pointArray = gTempSegmentArray[segIndex];
    
    document.getElementById("Output").innerHTML = "";//"<br/>处理路名:"+thisName;
    
    for (var j=0; j<pointArray.length;j++)
    {
        
        var btspoint = new BMap.Point(pointArray[j].lng, pointArray[j].lat);
        var btscircle = new BMap.Circle(btspoint,pointArray[j].raid*1000);
        btscircle.setFillOpacity(0.2);
        map.addOverlay(btscircle);
        
        //var point = new BMap.Point(116.404, 39.915);
        var marker = new BMap.Marker(btspoint);  // 创建标注
        map.addOverlay(marker);              // 将标注添加到地图中
        
        var label = new BMap.Label(j+":"+pointArray[j].cellid,{offset:new BMap.Size(-40,-20)});
        marker.setLabel(label);
        
    }
    
    segIndex++;
    
    
}


function matchRoad()
{
    map.clearOverlays();
    
    
    var matchIndex = 0;
    
    matchIndex = segIndex - 1;
    
    if (matchIndex < 0)
    {
        matchIndex = gTempSegmentArray.length - 1;
    }
    
    if (matchIndex >= gTempSegmentArray.length)
    {
        matchIndex = 0;
    }
    
    
    
    var pointArray = gTempSegmentArray[matchIndex];
    
    var pCnt = pointArray.length;
    if (pCnt > 1)
    {
        
        var P1 = new BMap.Point(pointArray[0].lng, pointArray[0].lat);
        var P2 = new BMap.Point(pointArray[pointArray.length-1].lng, pointArray[pointArray.length-1].lat);
        
        var PointListIndex = 99;
        if (pointArray[0].roadNames[0] == "环城高速东侧北向")
        {
            PointListIndex = 0;
        }
        if (pointArray[0].roadNames[0] == "环城高速北侧北向")
        {
            PointListIndex = 1;
        }
        if (pointArray[0].roadNames[0] == "成渝高速东向")
        {
            PointListIndex = 2;
        }
        if (pointArray[0].roadNames[0] == "机场高速北向")
        {
            PointListIndex = 3;
        }
        
        if (PointListIndex < 4)
        {
            var poinlist = gPathArray[PointListIndex];
            var retDistInfo1 = getNearestDistanceOfRoad(P1, poinlist);
            var retDistInfo2 = getNearestDistanceOfRoad(P2, poinlist);
        }
        
        var drivingOptions = {
        renderOptions: {map: map, panel: "results"},
            //onMarkersSet: onRouteMarkersSet,
        onSearchComplete: onDrivingSearchComplete,
        };
        var driving = new BMap.DrivingRoute(map, drivingOptions);
        var startPoint = retDistInfo1.projection;// new BMap.Point(106.598575,29.395151);
        var endPoint = retDistInfo2.projection;//new BMap.Point(106.446509,29.518006);
        driving.search(startPoint,endPoint);
        
        
    }
    
    
    
}

function NextSegPoint()
{
    map.clearOverlays();
    
    var matchIndex = 0;
    
    matchIndex = segIndex - 1;
    
    if (matchIndex < 0)
    {
        matchIndex = gTempSegmentArray.length - 1;
    }
    
    if (matchIndex >= gTempSegmentArray.length)
    {
        matchIndex = 0;
    }
    
    var pointArray = gTempSegmentArray[matchIndex];
    
    
    if (segPntIndex >= pointArray.length)
    {
        segPntIndex = 0;
    }
    
    
    document.getElementById("Output").innerHTML = "";//"<br/>处理路名:"+thisName;
    
    var btspoint = new BMap.Point(pointArray[segPntIndex].lng, pointArray[segPntIndex].lat);
    var btscircle = new BMap.Circle(btspoint,pointArray[segPntIndex].raid*1000);
    btscircle.setFillOpacity(0.2);
    map.addOverlay(btscircle);
    
    //var point = new BMap.Point(116.404, 39.915);
    var marker = new BMap.Marker(btspoint);  // 创建标注
    map.addOverlay(marker);              // 将标注添加到地图中
    
    var label = new BMap.Label(segPntIndex+":"+pointArray[segPntIndex].cellid,{offset:new BMap.Size(-40,-20)});
    marker.setLabel(label);
    
    document.getElementById("Output").innerHTML = "<br/>"+pointArray[segPntIndex].cellid+":"+pointArray[segPntIndex].roadIndex[0];

    
    
    segPntIndex++;
    
    
}


function TestFunction(index)
{
    
    var i =2;
    
    var ouHtml = new String();
    
    document.getElementById("RouteList").innerHTML = "";

    document.getElementById("RouteList").innerHTML += "<tr><td  onclick=\"TestAction("+1+")\"> 可能路线"+i+"，经过路段:";
    for (var j=0; j<2; j++)
    {
        
        document.getElementById("RouteList").innerHTML += "道路名" + j + ";";
        
    }
    document.getElementById("RouteList").innerHTML += " </td></tr>";

    
}

function TestAction(index)
{
    
    var point = new BMap.Point(104.545702,29.528792);       // 创建点坐标
    map.centerAndZoom(point,12);                            // 初始化地图,设置中心点坐标和地图级别。
    document.getElementById("Output").innerHTML += "AAAAAAAA"+index;//"</br><p   onclick=\"TestAction()\"> 可能路线--》点击我 </p>"

}


function DisplayRoute(index)
{
    
    //var segmentList = gRoutesArray[index];
    var segmentList = gPotentialPathLinks[index].segmentInfoList;
    segCnt = segmentList.length;
    
    map.clearOverlays();
    segIndex = 0;
    segPntIndex = 0;
    routeIndex = index;

    for (var i = 0; i<segCnt; i++)
    {
        //var pointArray = segmentList[i];
        var pointArray = segmentList[i].lacList;
        
        for (var j=0; j<pointArray.length;j++)
        {
            
            var btspoint = new BMap.Point(pointArray[j].lng, pointArray[j].lat);
            var btscircle = new BMap.Circle(btspoint,pointArray[j].raid*1000);
            btscircle.setFillOpacity(0.2);
            map.addOverlay(btscircle);
            
            //var point = new BMap.Point(116.404, 39.915);
            var marker = new BMap.Marker(btspoint);  // 创建标注
            map.addOverlay(marker);              // 将标注添加到地图中
            
            var label = new BMap.Label(j+":"+pointArray[j].cellid,{offset:new BMap.Size(-40,-20)});
            marker.setLabel(label);            
            
        }
    }

}


function RouteNextSegment()
{
    map.clearOverlays();
    segPntIndex = 0;
    
    //var segmentList = gRoutesArray[routeIndex];
    var segmentList = gPotentialPathLinks[routeIndex].segmentInfoList;
    
    if (segIndex >= segmentList.length)
    {
        segIndex = 0;
    }
    
    //var pointArray = segmentList[segIndex];
    var pointArray = segmentList[segIndex].lacList;
    
    document.getElementById("Output").innerHTML = ""+segmentList[segIndex].rdName;//"<br/>处理路名:"+thisName;
    
    for (var j=0; j<pointArray.length;j++)
    {
        
        var btspoint = new BMap.Point(pointArray[j].lng, pointArray[j].lat);
        var btscircle = new BMap.Circle(btspoint,pointArray[j].raid*1000);
        btscircle.setFillOpacity(0.2);
        map.addOverlay(btscircle);
        
        //var point = new BMap.Point(116.404, 39.915);
        var marker = new BMap.Marker(btspoint);  // 创建标注
        map.addOverlay(marker);              // 将标注添加到地图中
        
        var label = new BMap.Label(j+":"+pointArray[j].cellid,{offset:new BMap.Size(-40,-20)});
        marker.setLabel(label);
        
        
    }
    
    segIndex++;
    
    
}

function RouteNextSegPoint()
{
    map.clearOverlays();
    
    //var segmentList = gRoutesArray[routeIndex];
    var segmentList = gPotentialPathLinks[routeIndex].segmentInfoList;

    
    var matchIndex = 0;
    
    matchIndex = segIndex - 1;
    
    if (matchIndex < 0)
    {
        matchIndex = segmentList.length - 1;
    }
    
    if (matchIndex >= segmentList.length)
    {
        matchIndex = 0;
    }
    
    //var pointArray = segmentList[matchIndex];
    var pointArray = segmentList[matchIndex].lacList;

    
    if (segPntIndex >= pointArray.length)
    {
        segPntIndex = 0;
    }
    
    
    document.getElementById("Output").innerHTML = "";//"<br/>处理路名:"+thisName;
    
    var btspoint = new BMap.Point(pointArray[segPntIndex].lng, pointArray[segPntIndex].lat);
    var btscircle = new BMap.Circle(btspoint,pointArray[segPntIndex].raid*1000);
    btscircle.setFillOpacity(0.2);
    map.addOverlay(btscircle);
    
    var marker = new BMap.Marker(btspoint);  // 创建标注
    map.addOverlay(marker);              // 将标注添加到地图中
    
    var label = new BMap.Label(segPntIndex+":"+pointArray[segPntIndex].cellid,{offset:new BMap.Size(-40,-20)});
    marker.setLabel(label);
    
    document.getElementById("Output").innerHTML = "<br/>"+pointArray[segPntIndex].cellid+":"+pointArray[segPntIndex].roadIndex[0];
    
    
    
    segPntIndex++;
    
    
}


function ShowSpeed()
{
    
    var segmentList = gPotentialPathLinks[routeIndex].segmentInfoList;
    
    var matchIndex = 0;
    
    matchIndex = segIndex - 1;
    
    if (matchIndex < 0)
    {
        matchIndex = segmentList.length - 1;
    }
    
    if (matchIndex >= segmentList.length)
    {
        matchIndex = 0;
    }

    var speedArray = segmentList[matchIndex].speedList;
    
    if (!speedArray && speedArray.length<=0)
    {
        return;
    }
    
    
    for (var j=0; j<speedArray.length;j++)
    {
        var stMapPoint = new BMap.Point(speedArray[j].stLng, speedArray[j].stLat);
        var edMapPoint = new BMap.Point(speedArray[j].edLng, speedArray[j].edLat);
        
        var SpPoints = getRoadSegPointsByStartEnd(stMapPoint, edMapPoint, segmentList[matchIndex].rdName);
        var speed4Mapval = getSpeedInfo4Map(speedArray[j].speed);
        var polyline = new BMap.Polyline(SpPoints, {strokeColor:speed4Mapval.color, strokeWeight:speed4Mapval.lineWeight, strokeOpacity:1.0});
        map.addOverlay(polyline);
    }

    
}

function ShowSpeedwitStat()
{
    
    map.clearOverlays();
    
    combineTraffic();
    
    var rdCnt = gPathTraffic.length;
    document.getElementById("RouteList").innerHTML = "";//"<br/>"+j+": "+speedArray[j].speed;//"<br/>处理路名:"+thisName;
    document.getElementById("Output").innerHTML = "";
    
    for (var i=0; i<rdCnt; i++)
    {
        var rdName = gPathTraffic[i].rdName;
        var pntList = getRoadPointsbyName(rdName);
        var periodCnt = gPathTraffic[i].TraffPeriodList.length;
        
        for (var j=0; j<periodCnt; j++)
        {
            var periodItem = gPathTraffic[i].TraffPeriodList[j];
            var segCnt = periodItem.segTrafficList.length;
            
            
            for (var k=0; k<segCnt; k++)
            {                
                var speed4Mapval = getSpeedInfo4Map(periodItem.segTrafficList[k].avgSpeed);

                var trafficPntList = new Array();
                for (var l=periodItem.segTrafficList[k].stIndex; l<=periodItem.segTrafficList[k].edIndex; l++)
                {
                    trafficPntList.push(pntList[l]);
                }
                
                var polyline = new BMap.Polyline(trafficPntList, {strokeColor:speed4Mapval.color, strokeWeight:speed4Mapval.lineWeight, strokeOpacity:1.0});
                map.addOverlay(polyline);
                
                var speedDiscr = "";
                if (speed4Mapval.level == 1)
                {
                    var speedDiscr = "拥堵(<30KMPH)";
                }
                if (speed4Mapval.level == 2)
                {
                    var speedDiscr = "车多(30-60KMPH)";
                }
                if (speed4Mapval.level == 3)
                {
                    var speedDiscr = "畅通(>60KMPH)";
                }

                var TmpDT = new Date(periodItem.periodBegin);
                var timeStr = TmpDT.getFullYear() + "-"+TmpDT.getMonth()+"-"+TmpDT.getDate()+" "+TmpDT.getHours()+":"+TmpDT.getMinutes()+":"+TmpDT.getSeconds();
                

                var lastPnt = trafficPntList.length - 1;
                document.getElementById("RouteList").innerHTML += "<br/>"+gPathTraffic[i].rdName+", "+speedDiscr;
                document.getElementById("RouteList").innerHTML += "<br/>From:"+trafficPntList[0].lng.toFixed(6)+","+trafficPntList[0].lat.toFixed(6)+" To:"+trafficPntList[lastPnt].lng.toFixed(6)+","+trafficPntList[lastPnt].lat.toFixed(6);

            }
            
        }

    }
    
}



function getNearestBTS(locPoint)
{
    var nearestBTS = 0;
    var nearestDist = 9999999999.9;
    for (var i=0; i<btsArray.length; i++)
    {
        var btsInfo = btsArray[i];
        var btspoint = new BMap.Point(btsInfo.lng, btsInfo.lat);
        var retdst = map.getDistance(btspoint, locPoint);
        
        if (nearestDist*1.0 >  retdst)
        {
            nearestDist = retdst;
            nearestBTS = btsInfo;
        }
    }

    return nearestBTS;
}


function drawBTS(inputBtsInfo, title)
{
    var btspoint = new BMap.Point(inputBtsInfo.lng, inputBtsInfo.lat);
    var btscircle = new BMap.Circle(btspoint,inputBtsInfo.raid*1000);
    btscircle.setFillOpacity(0.2);
    map.addOverlay(btscircle);
    
    var marker = new BMap.Marker(btspoint);  // 创建标注
    map.addOverlay(marker);              // 将标注添加到地图中
    
    var label = new BMap.Label(title,{offset:new BMap.Size(-40,-20)});
    marker.setLabel(label);
}


function CreateSampleSegment()
{
    map.clearOverlays();

    var sampleSpeed = document.getElementById("SPEED").value;
    var sampleRdID = document.getElementById("ROADID").value;
    var userID = document.getElementById("USERID").value;
    var iradius = document.getElementById("DELETAL").value;
    var roadPnts = gPathArray[sampleRdID];
    
    //var stMapPnt = new BMap.Point(startPoint.lng, startPoint.lat);
    var stDistInfo = getNearestDistanceOfRoad(sampleSt, roadPnts);
    
    //var edMapPnt = new BMap.Point(endPoint.lng, endPoint.lat);
    var edDistInfo = getNearestDistanceOfRoad(sampleEd, roadPnts);
    
    document.getElementById("Output").innerHTML = "<br/>"+stDistInfo.index+":"+edDistInfo.index+":"+ roadPnts.length;

    getSamplePoints(stDistInfo.index, edDistInfo.index, roadPnts, sampleSpeed, "2012-11-20 15:30:00", userID, iradius);
    

}

function AddSelectMarker()
{
    map.clearOverlays();
    AddStPoint();
    AddEdPoint();
}



function ClearOverlayOnMap()
{
    map.clearOverlays();

    
}


