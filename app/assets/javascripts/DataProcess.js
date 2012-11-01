

//判断pnt是否在由（p1, p2）两点组成的线段范围内，类型为BMap.Point
//方法：计算投影点，然后判断投影点是否在线段内；如果在里头返回距离和投影点
//Note: 允许投影点在线段两端的误差，目前本函数还没加入这个误差；

//function  GetNearLineDistance(locPoint,  lineP1, lineP2)
function  GetNearLineDistance(pnt,  p1, p2)
{
    
    var a = (p2.lat-p1.lat);
    var b = p1.lng-p2.lng;
    var c = p1.lat*p2.lng-p1.lng*p2.lat;
    
    var dSPtLng = (b*b*pnt.lng - a*(b*pnt.lat + c))/(a*a + b*b);
    var dSPtLat = (a*a*pnt.lat - b*(a*pnt.lng + c))/(a*a + b*b);
    
    var retpnt = new BMap.Point(dSPtLng, dSPtLat);
    var retdst = 9999999999;
    var retinline = 0;
    
    
    //投影点是否在线段内；之所以这么写是为了避免复杂浮点运算；
    if (p1.lng < p2.lng)//横坐标判断
    {
        if ((dSPtLng < p1.lng) || (dSPtLng > p2.lng)) //不在线段内，还没加入误差
        {
            retinline = 0;
        }
    }
    else
    {
        if ((dSPtLng > p1.lng) || (dSPtLng < p2.lng)) //不在线段内，还没加入误差
        {
            retinline = 0;
        }
    }
    
    if (p1.lat < p2.lat) //纵坐标判断
    {
        if ((dSPtLat < p1.lat) || (dSPtLat > p2.lat)) //不在线段内，还没加入误差
        {
            retinline = 0;
        }
    }
    else
    {
        if ((dSPtLat > p1.lat) || (dSPtLat < p2.lat)) //不在线段内，还没加入误差
        {
            retinline = 0;
        }
    }
    
    retdst = map.getDistance(pnt, retpnt);
    
    var retInfo = new DistInfo(retpnt, retdst, retinline, 0);
    return retInfo;
};




//该方法获取LocationPoint和路径（数组roadPoints给出）的最短距离；
//返回结构该结构用于在判断一个点和路径上的关系的时候，返回最短距离、投影点、以及投影点在路径点数组中对应Index等；
function getNearestDistanceOfRoad(LoctionPoint, roadPoints)
{
    var retpnt = new BMap.Point(0, 0);
    var retIdx = 0;
    
    var pointCount = roadPoints.length;
    if (pointCount < 2)
    {
        var retInfo = new DistInfo(retpnt, 9999999999, 0);
        return retInfo;
    }
    
    var nearestDistance =  map.getDistance(LoctionPoint, roadPoints[0]);
    
    retpnt = roadPoints[0];
    retIdx = 0;
    
    
    
    projPoint = new BMap.Point(0, 0);
    for (var i=0; i< (pointCount-1);  i++)
    {
        var pntDistInfo = GetNearLineDistance(LoctionPoint, roadPoints[i], roadPoints[i+1]);
        if ((pntDistInfo.isInLine == 1) && (pntDistInfo.distance <= nearestDistance))
        {
            nearestDistance = pntDistInfo.distance;
            retpnt = roadPoints[0];
            retIdx = i;
        }
        var endPointDist = map.getDistance(LoctionPoint, roadPoints[i+1]); //避免落在投影外的情况，譬如凸折现连接外的点
        if (endPointDist <= nearestDistance)
        {
            nearestDistance = endPointDist;
            retpnt = roadPoints[i+1];
            retIdx = i;
        }
        
    }
    
    var retInfo = new DistInfo(retpnt, nearestDistance, 1, retIdx);
    return retInfo;
    
}


//数据处理模块
SplitDataSegment = function()
{
    //    if (luArray.length <= 0)
    //    {
    //        alert("位置更新数据尚未加载");
    //    }
    //    else
    //    {
    //        gSegmentArray = splitSegment(luArray);
    //    }
    
    
    if (gSegmentArray.length == 0)
    {
        alert("位置更新数据尚未加载");
    }
    else
    {
        var newLists = new Array();
        
        for (var i=0; i<gSegmentArray.length; i++)
        {
            var tmpList = gSegmentArray[i];
            
            var breakList = splitSegment(tmpList);
            for (var j=0; j < breakList.length; j++)// breakseg in breakList)
            {
                var breakseg = breakList[j];
                newLists.push(breakseg);
            }
        }
        
        gSegmentArray = newLists;
    }
    
}


//位置更新数据分段
function splitSegment(luInfoArray)
{
    segIndex = 0;
    //gSegmentArray.splice(0,0);
    
    var segmentArray = new Array();
    //var elementCnt = 0;
    var tempLuList = new Array();
    
    var rangeAccuracy = 4;//document.getElementById("RAccuracy").value;
    
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
                
            }
            
            //最后一个点了，把临时队列加入到返回的队列中
            if (i==(luInfoArray.length-1))
            {
                segmentArray.push(tempLuList);
            }

        }
        else
        {
            tempLuList.push(luInfoArray[i]);
        }
        
    }
    
    return segmentArray;
    
}


SplitDataSegmentbyTime = function()
{
    if (gSegmentArray.length == 0)
    {
        alert("位置更新数据尚未加载");
    }
    else
    {
        var newLists = new Array();
        
        for (var i=0; i<gSegmentArray.length; i++)
        {
            var tmpList = gSegmentArray[i];
            
            var breakList = splitSegmentByTime(tmpList);
            for (var j=0; j < breakList.length; j++)// breakseg in breakList)
            {
                var breakseg = breakList[j];
                newLists.push(breakseg);
            }
        }
        
        //alert("segmentCnt="+newLists.length);
        gSegmentArray = newLists;
    }

    
}

//这段代码可能有点问题
function splitSegmentByTime(luInfoArray)
{
    segIndex = 0;
    
    var segmentArray = new Array();
    var tempLuList = new Array();
    
    var timeAccuracy = 15*60;//document.getElementById("TAccuracy").value * 60; //分钟转换为秒
    
    for (var i=0; i<luInfoArray.length; i++)
    {
        
        if (tempLuList.length > 0)
        {
            var segmentIndex = tempLuList.length - 1;
            
            var time1 = new Date(luInfoArray[i].time);
            var time2 = new Date(tempLuList[segmentIndex].time);
            var timediff = Math.abs(time1.getTime() - time2.getTime())/1000; //毫秒转换为秒
            
            //如果时间间隔很长，则分段
            if (timediff > timeAccuracy)
            {
                segmentArray.push(tempLuList);
                var tempLuList = new Array();
                tempLuList.push(luInfoArray[i]);
            }
            else
            {
                tempLuList.push(luInfoArray[i]);
            }
            //最后一个点了，把临时队列加入到返回的队列中
            if (i==(luInfoArray.length-1))
            {
                segmentArray.push(tempLuList);
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
    //alert("处理完毕，删除小区个数:"+cnt);
    segIndex = 0;
    //NextSegment();
    
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
    
    
    //alert("处理完毕，删除小区个数:"+cnt);
    segIndex = 0;
    //NextSegment();
    
    
}



function clearPingPong(luInfoArray)
{
    
    var tempLuList = new Array();
    
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
    
    
    //alert("处理完毕，删除小区个数:"+cnt);
    segIndex = 0;
    //NextSegment();
    
    
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


//数据处理模块
SplitDataSegmentWithRoad = function()
{
    if (gSegmentArray.length == 0)
    {
        alert("位置更新数据尚未加载");
    }
    else
    {
        //document.getElementById("Output").innerHTML = "";
        //document.getElementById("Output").innerHTML += "<br/>gSegmentArray Length="+gSegmentArray.length;
        
        var newLists = new Array();
        
        //var tmpList = new Array;// = gSegmentArray[0];
        
        //for (tmpList in gSegmentArray)
        for (var i=0; i<gSegmentArray.length; i++)
        {
            var tmpList = gSegmentArray[i];
            
            //document.getElementById("Output").innerHTML += "<br/>tmpList Length="+tmpList.length;
            
            var breakList = segmentwithRoad(tmpList);
            
            for (var j=0; j < breakList.length; j++)// breakseg in breakList)
            {
                var breakseg = breakList[j];
                
                //document.getElementById('Output').innerHTML += "</br>第" + j + "个队列，点数="+breakseg.length;
                
                newLists.push(breakseg);
            }
        }
        
        //alert("segmentCnt="+newLists.length);
        gSegmentArray = newLists;
        
        
//        for (var k=0; k < newLists.length; k++)// breakseg in breakList)
//        {
//            var listtt = newLists[k];
//            document.getElementById('Output').innerHTML += "</br>第" + k + "个队列，点数="+listtt.length;
//            
//            for (var l=0; l < listtt.length; l++)// breakseg in breakList)
//            {
//                document.getElementById('Output').innerHTML += "</br>"+ l+ "\tCELL:"+listtt[l].cellid +":"+ listtt[l].lng+","+listtt[l].lat;
//            }
//            
//            
//        }
    }
}


function segmentwithRoad(luInfoArray)
{
    
    var segmentList = new Array();
    var breakIndex = 0;
    //    var tempLuList = new Array();
    //
    //    var rdNameCnt = new Array();
    //    //var rdPntCnt = new Array();
    //
    //    //每个点
    //    for (var i=0; i<luInfoArray.length; i++)
    //    {
    //        //对每个点所对应的路径进行统计
    //        for (var tmpname in luInfoArray[i].roadNames)
    //        {
    //            var isFound = 0;
    //            for (var rndCnt in rdNameCnt)
    //            {
    //                if (tmpname == rndCnt.name)
    //                {
    //                    rndCnt.count ++;
    //                    isFound = 1;
    //                    break;
    //                }
    //            }
    //            if (isFound == 0)
    //            {
    //                var newRndCnt = new RoadPntCnt(rndCnt.name, 1);
    //                rdNameCnt.push(newRndCnt);
    //            }
    //
    //        }
    //    }
    //document.getElementById("Output").innerHTML += "<br/>InputLength="+luInfoArray.length;
    
    for (var i=0; i<luInfoArray.length; i++)
    {
        //if (luInfoArray[i]
        //document.getElementById("Output").innerHTML += "<br/>"+i+":"+"CellID:"+luInfoArray[i].cellid;
        
        for (var jjjk=0;  jjjk< luInfoArray[i].roadNames.length; jjjk++)
        {
            var printname = luInfoArray[i].roadNames[jjjk];
            //document.getElementById("Output").innerHTML += "<br/>路名:"+printname;
        }
        
        if (segmentList.length == 0)
        {
            if ((luInfoArray.length - i) > 1) //看看后续是否还有至少两个点有 相同的路名，如果没有则丢弃
            {
                //for (var thisName in luInfoArray[i].roadNames)
                for (var nameIdx=0;  nameIdx< luInfoArray[i].roadNames.length; nameIdx++)
                {
                    var thisName = luInfoArray[i].roadNames[nameIdx];
                    //document.getElementById("Output").innerHTML += "<br/>刚开始新处理路名:"+thisName;
                    
                    var isFound1 = 0;
                    //for (var tmpname in luInfoArray[i+1].roadNames)
                    for (var cmpIdx = 0; cmpIdx<luInfoArray[i+1].roadNames.length; cmpIdx++)
                    {
                        var tmpname = luInfoArray[i+1].roadNames[cmpIdx];
                        //document.getElementById("Output").innerHTML += "<br/>对比路名:"+tmpname;
                        
                        if (tmpname == thisName)
                        {
                            isFound1 =1;
                            //document.getElementById("Output").innerHTML += "<br/>找到对比路名:"+tmpname+":"+thisName;
                            
                            break;
                        }
                    }
//                    var isFound2 = 1;
//                    for (var cmpIdx = 0; cmpIdx<luInfoArray[i+2].roadNames.length; cmpIdx++)
//                    {
//                        var tmpname = luInfoArray[i+2].roadNames[cmpIdx];
//                        //document.getElementById("Output").innerHTML += "<br/>对比路名:"+tmpname;
//
//                        if (tmpname == thisName)
//                        {
//                            //document.getElementById("Output").innerHTML += "<br/>找到对比路名:"+tmpname+":"+thisName;
//
//                            isFound2 =1;
//                            break;
//                        }
//                    }
                    
                    if (isFound1==1)// && isFound2==1)
                    {
                        var newList = new RoadInfo(thisName);
                        var newTmpPushPnt = new LocationUpdateInfo(luInfoArray[i].time,luInfoArray[i].phonenumber,luInfoArray[i].cellid);
                        newTmpPushPnt.lng=luInfoArray[i].lng;
                        newTmpPushPnt.lat=luInfoArray[i].lat;
                        newTmpPushPnt.raid=luInfoArray[i].raid;
                        newTmpPushPnt.roadNames = new Array();
                        newTmpPushPnt.roadIndex = new Array();
                        
                        for (var tii = 0; tii< luInfoArray[i].roadNames.length; tii++)
                        {
                            newTmpPushPnt.roadNames.push(luInfoArray[i].roadNames[tii]);
                        }
                        
                        for (var tii = 0; tii< luInfoArray[i].roadIndex.length; tii++)
                        {
                            newTmpPushPnt.roadIndex.push(luInfoArray[i].roadIndex[tii]);
                        }
                        
                        newList.pointList.push(newTmpPushPnt);
                        
                        //newList.pointList.push(luInfoArray[i]);
                        segmentList.push(newList);
                        //document.getElementById("Output").innerHTML += "<br/>新路名:"+thisName;
                    }
                    else
                    {
                        //document.getElementById("Output").innerHTML += "<br/>后续没有相同的路名:"+thisName;
                    }
                    
                }
            }
            else
            {
                //document.getElementById("Output").innerHTML += "<br/>该段的点数不够:"+i+":"+luInfoArray.length;
            }
        }
        else
        {
            for (var nameIdx=0;  nameIdx< luInfoArray[i].roadNames.length; nameIdx++)
            {
                var thisName = luInfoArray[i].roadNames[nameIdx];
                //
                //            for (var thisName in luInfoArray[i].roadNames)
                //            {
                //document.getElementById("Output").innerHTML += "<br/>处理路名:"+thisName;
                
                var segmentCnt = segmentList.length;
                
                
                var isinSeg = 0; //是否存在已有路段中
                for (var si=0; si<segmentCnt; si++)
                {
                    var tmpseg = segmentList[si];
                    if (thisName == tmpseg.name)
                    {
                        var newTmpPushPnt = new LocationUpdateInfo(luInfoArray[i].time,luInfoArray[i].phonenumber,luInfoArray[i].cellid);
                        newTmpPushPnt.lng=luInfoArray[i].lng;
                        newTmpPushPnt.lat=luInfoArray[i].lat;
                        newTmpPushPnt.raid=luInfoArray[i].raid;
                        newTmpPushPnt.roadNames = new Array();
                        newTmpPushPnt.roadIndex = new Array();
                        
                        for (var tii = 0; tii< luInfoArray[i].roadNames.length; tii++)
                        {
                            newTmpPushPnt.roadNames.push(luInfoArray[i].roadNames[tii]);
                        }
                        
                        for (var tii = 0; tii< luInfoArray[i].roadIndex.length; tii++)
                        {
                            newTmpPushPnt.roadIndex.push(luInfoArray[i].roadIndex[tii]);
                        }
                        tmpseg.pointList.push(newTmpPushPnt);

                        //tmpseg.pointList.push(luInfoArray[i]);
                        isinSeg =1;
                    }
                }
                
                if (isinSeg == 1)
                {
                    continue;
                }
                else
                {
                    if ((luInfoArray.length-i) > 1) //看看后续是否还有至少两个点有 相同的路名，如果没有则丢弃
                    {
                        
                        var isFound1 = 0;
                        for (var cmpIdx = 0; cmpIdx<luInfoArray[i+1].roadNames.length; cmpIdx++)
                        {
                            var tmpname = luInfoArray[i+1].roadNames[cmpIdx];
                            if (tmpname == thisName)
                            {
                                isFound1 =1;
                                break;
                            }
                        }
//                        var isFound2 = 0;
//                        for (var cmpIdx = 0; cmpIdx<luInfoArray[i+2].roadNames.length; cmpIdx++)
//                        {
//                            var tmpname = luInfoArray[i+2].roadNames[cmpIdx];
//                            if (tmpname == thisName)
//                            {
//                                isFound2 =1;
//                                break;
//                            }
//                        }
                        
                        if (isFound1==1)// && isFound2==1)
                        {
                            var newList = new RoadInfo(thisName);
                            var newTmpPushPnt = new LocationUpdateInfo(luInfoArray[i].time,luInfoArray[i].phonenumber,luInfoArray[i].cellid);
                            newTmpPushPnt.lng=luInfoArray[i].lng;
                            newTmpPushPnt.lat=luInfoArray[i].lat;
                            newTmpPushPnt.raid=luInfoArray[i].raid;
                            newTmpPushPnt.roadNames = new Array();
                            newTmpPushPnt.roadIndex = new Array();
                            
                            for (var tii = 0; tii< luInfoArray[i].roadNames.length; tii++)
                            {
                                newTmpPushPnt.roadNames.push(luInfoArray[i].roadNames[tii]);
                            }
                            
                            for (var tii = 0; tii< luInfoArray[i].roadIndex.length; tii++)
                            {
                                newTmpPushPnt.roadIndex.push(luInfoArray[i].roadIndex[tii]);
                            }
                            newList.pointList.push(newTmpPushPnt);

                            //newList.pointList.push(luInfoArray[i]);
                            segmentList.push(newList);
                            breakIndex = i; //添加断裂点
                            //document.getElementById("Output").innerHTML += "<br/>新断裂点:"+i+":"+thisName;
                            
                        }
                    }
                }
            }
        }
    }
    
    
    //tempLuList.push(luInfoArray[i]);
    
    var retLists = new Array();
    
    for (var si=0; si<segmentList.length; si++)
    {
        var tmpseg = segmentList[si];
        for (var pi=0;pi<tmpseg.pointList.length;pi++)
        {
//            var newPoint2Push = tmpseg.pointList[pi];
//            newPoint2Push.roadNames.splice(0);
//            newPoint2Push.roadNames.push(tmpseg.name);
            
            //先记录Index
            var roadpointindex = -1;
            for (var cnidx=0;cnidx<tmpseg.pointList[pi].roadNames.length;cnidx++)
            {
                if (tmpseg.pointList[pi].roadNames[cnidx] == tmpseg.name)
                {
                    roadpointindex = tmpseg.pointList[pi].roadIndex[cnidx];
                }
            }
            
            tmpseg.pointList[pi].roadNames.splice(0);
            tmpseg.pointList[pi].roadNames.push(tmpseg.name);
            
            tmpseg.pointList[pi].roadIndex.splice(0);
            tmpseg.pointList[pi].roadIndex.push(roadpointindex);

        }
        retLists.push(tmpseg.pointList);
    }
    return retLists;
    
}


DirectionMatchAndClear = function ()
{
    if (gSegmentArray.length == 0)
    {
        alert("位置更新数据尚未加载");
    }
    else
    {
        var newLists = new Array();
        
        for (var i=0; i<gSegmentArray.length; i++)
        {
            var tmpList = gSegmentArray[i];
            
            var breakList = segmentwithDirection(tmpList);
            for (var j=0; j < breakList.length; j++)// breakseg in breakList)
            {
                var breakseg = breakList[j];
                newLists.push(breakseg);
            }
        }
        
        //alert("segmentCnt="+newLists.length);
        gSegmentArray = newLists;
    }    
}


function segmentwithDirection(luInfoArray)
{
    
    segIndex = 0;
    
    var segmentArray = new Array();
    var tempLuList = new Array();
    
    
    //如果不够三个点不可能构成两个方向
    if (luInfoArray.length < 3)
    {
        //return segmentArray;
        var newList = new Array();
        
        for (var i=0; i<luInfoArray.length; i++)
        {
            var newTmpPushPnt = new LocationUpdateInfo(luInfoArray[i].time,luInfoArray[i].phonenumber,luInfoArray[i].cellid);
            newTmpPushPnt.lng=luInfoArray[i].lng;
            newTmpPushPnt.lat=luInfoArray[i].lat;
            newTmpPushPnt.raid=luInfoArray[i].raid;
            newTmpPushPnt.roadNames = new Array();
            newTmpPushPnt.roadIndex = new Array();
            
            for (var tii = 0; tii< luInfoArray[i].roadNames.length; tii++)
            {
                newTmpPushPnt.roadNames.push(luInfoArray[i].roadNames[tii]);
            }
            
            for (var tii = 0; tii< luInfoArray[i].roadIndex.length; tii++)
            {
                newTmpPushPnt.roadIndex.push(luInfoArray[i].roadIndex[tii]);
            }
            newList.push(newTmpPushPnt);
        }
        
        segmentArray.push(newList);
        return segmentArray;
    }
    
    //一开始构造两个点形成的段
    tempLuList.push(luInfoArray[0]);
    tempLuList.push(luInfoArray[1]);

    var preIndexDiff = luInfoArray[1].roadIndex[0] - luInfoArray[0].roadIndex[0];

    //document.getElementById("Output").innerHTML += "<br/>" + "//----------//";

    for (var i=2; i<luInfoArray.length; i++)
    {
        
        var segmentIndex = tempLuList.length - 1;
        
        var currentIndex = luInfoArray[i].roadIndex[0]-tempLuList[segmentIndex].roadIndex[0];
        //var index1 = tempLuList[segmentIndex].roadIndex[0];
        
        var direction;// = currentIndex/preIndexDiff;
        

        //document.getElementById("Output").innerHTML += "<br/>" + "prediff="+preIndexDiff+"Curren:"+currentIndex;

        if (preIndexDiff == 0)
        {
            tempLuList.push(luInfoArray[i]);
            //document.getElementById("Output").innerHTML += "<br/>" + "prediff="+preIndexDiff;//+"Curren:"+currentIndex;

        }
        else
        {
            direction = currentIndex/preIndexDiff;
            
            //方向相反
            if (direction < 0)
            {
                if ((luInfoArray.length - i) > 1)  //判断下一跳，避免反复
                {
                    var nextIndexDiff = luInfoArray[i+1].roadIndex[0]-tempLuList[segmentIndex].roadIndex[0];
                    var nextDirection = nextIndexDiff/preIndexDiff;
                    
                    //document.getElementById("Output").innerHTML += "<br/>" + "prediff="+preIndexDiff+"Next:"+nextDirection;

                    if (nextDirection < 0) //下一跳也是反的
                    {
                        segmentArray.push(tempLuList);
                        var tempLuList = new Array();
                        tempLuList.push(luInfoArray[i-1].Clone()); //转折点也要Push进去
                        tempLuList.push(luInfoArray[i]);
                    }
                    else
                    {
                        tempLuList.push(luInfoArray[i]);

                    }
                }
                else
                {
                    //document.getElementById("Output").innerHTML += "<br/>" + "相反，后续位数不足";//+preIndexDiff+"Next:"+nextDirection;

                    segmentArray.push(tempLuList);
                    var tempLuList = new Array();
                    tempLuList.push(luInfoArray[i-1].Clone()); //转折点也要Push进去
                    tempLuList.push(luInfoArray[i]);
                }
            }
            else
            {
                tempLuList.push(luInfoArray[i]);
            }
        }
        
        preIndexDiff = currentIndex;

        //最后一个点了，把临时队列加入到返回的队列中
        if (i==(luInfoArray.length-1))
        {
            segmentArray.push(tempLuList);
        }
        
    }
    
    return segmentArray;
    
}


GetRouteDirection = function ()
{
    //document.getElementById("Output").innerHTML = "";
    
    var newArrayLists = new Array();
    
    for (var i=0; i<gSegmentArray.length; i++)
    {
        var tmpList = gSegmentArray[i];
        
        var directDiff = 0;
        for (var j=0; j<tmpList.length; j++)
        {
            if (j==0)
            {
                continue;
            }
            
            directDiff += tmpList[j].roadIndex[0] - tmpList[j-1].roadIndex[0];
        }
        
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

        if (tmpList[0].roadNames[0] == "环城高速东侧")
        {
            if (directDiff > 0) //默认（北向）
            {
                for (var j=0; j<tmpList.length; j++)
                {                    
                    tmpList[j].roadNames[0] = "环城高速东侧 北向";
                }

            }
            else                //南向
            {
                for (var j=0; j<tmpList.length; j++)
                {
                    tmpList[j].roadNames[0] = "环城高速东侧 南向";
                    //是否需要重新匹配Index?
                }


            }
        }
        if (tmpList[0].roadNames[0] == "环城高速北侧")
        {
            if (directDiff > 0) //北向
            {
                for (var j=0; j<tmpList.length; j++)
                {
                    tmpList[j].roadNames[0] = "环城高速北侧 北向";
                }

            }
            else                //南向
            {
                for (var j=0; j<tmpList.length; j++)
                {
                    tmpList[j].roadNames[0] = "环城高速北侧 南向";
                }
            }
        }
        if (tmpList[0].roadNames[0] == "成渝高速") 
        {
            if (directDiff > 0) //东向
            {
                for (var j=0; j<tmpList.length; j++)
                {
                    tmpList[j].roadNames[0] = "成渝高速 东向";
                }

            }
            else                //西向
            {
                for (var j=0; j<tmpList.length; j++)
                {
                    tmpList[j].roadNames[0] = "成渝高速 西向";
                }

            }
        }
        if (tmpList[0].roadNames[0] == "机场高速") 
        {
            if (directDiff > 0) //北向
            {
                for (var j=0; j<tmpList.length; j++)
                {
                    tmpList[j].roadNames[0] = "机场高速 北向";
                }

            }
            else                //南向
            {
                for (var j=0; j<tmpList.length; j++)
                {
                    tmpList[j].roadNames[0] = "机场高速 南向";
                }

            }
        }
    }
    

}


MergePaths = function ()
{
    //document.getElementById("Output").innerHTML = "";

    if (gSegmentArray.length == 0)
    {
        alert("位置更新数据尚未加载");
        return;
    }
    
    GetRouteDirection();
    
    if (gSegmentArray.length == 1) //只有一条路，给出可信度即可；不需要判断做可能路径列表判断
    {
        var routesArray = new Array();
        var routesContainer = new Array();
        routesContainer.push(gSegmentArray[0]);
        routesArray[0] = routesContainer;
        gRoutesArray = routesArray;
        
        return;
    }
    
    var newArrayLists = new Array();

    //document.getElementById("Output").innerHTML += "</br>"+"排序前段数:"+gSegmentArray.length;
    
    //先按照开始时间排序
    for (var i=0; i<gSegmentArray.length; i++)
    {
        var tmpList = new Array();
        tmpList = gSegmentArray[i];

        //低效的排序法；先保证正确
        if (newArrayLists.length > 0)
        {
            var time1 = new Date(tmpList[0].time);
            var ArCnt = newArrayLists.length;

            var isFound = 0;
            for (var j=0; j<ArCnt; j++)
            {
                var preArray = newArrayLists[j];
                var time2 = new Date(preArray[0].time);
                
                if (time1.getTime() == time2.getTime()) //如果开始时间相等，比较结束时间：如果三段时间相同的情况？？
                {
                    var time3 = new Date(tmpList[tmpList.length-1].time);
                    var time4 = new Date(preArray[preArray.length-1].time);
                    if (time3.getTime() >= time4.getTime())
                    {
                        newArrayLists.splice(j+1,0,tmpList);  //插入在后面
                    }
                    else
                    {
                        newArrayLists.splice(j,0,tmpList);    //插入在前面
                    }
                    isFound = 1;
                    break;
                }
                else
                {
                    if (time1.getTime() > time2.getTime())
                    {
                        //时间比当前位置的还大，继续往后找
                    }
                    else
                    {
                        newArrayLists.splice(j,0,tmpList);    //插入在前面
                        isFound = 1;
                        break;
                    }
                }
            }
            
            if (isFound == 0) //比队列里头的时间都大，放到最后
            {
                newArrayLists.push(tmpList);
            }
            
        }
        else
        {
            newArrayLists.push(tmpList);
        }
    }
    
    //document.getElementById("Output").innerHTML += "</br>"+"排序后段数:"+newArrayLists.length;

    var R2ArrayLists = new Array();
    var TmpBTreeContainer = new Array();
    var TmpBTreeNode = new Array();
    TmpBTreeNode.push(newArrayLists[0]);//A
    TmpBTreeContainer[0] = TmpBTreeNode;
    R2ArrayLists[0] = TmpBTreeContainer;
    
    var BTreeDeep = 1;
    //然后对每段根据时间进行连接，得到一条获得多条可能路径
    for (var i=1; i<newArrayLists.length; i++)
    {
        var tmpList1 = newArrayLists[i-1];
        var date1 = new Date(tmpList1[0].time);
        
        var tmpList2 = newArrayLists[i];
        var date2 = new Date(tmpList2[0].time);

        var date3 = new Date(tmpList1[tmpList1.length-1].time);
        var date4 = new Date(tmpList2[tmpList2.length-1].time);
        
        var time1 = date1.getTime();
        var time2 = date2.getTime();
        var time3 = date3.getTime();
        var time4 = date4.getTime();


        //document.getElementById("Output").innerHTML += "</br>"+"比较T1/T2/T3/T4:"+time1+"/"+time2+":"+time3+"/"+time4;

        
        if (time1 == time2) //开始时间相同
        {
            //document.getElementById("Output").innerHTML += "</br>"+"比较 开始时间相同";

            if (time3 == time4) //结束时间相同，分裂为A/B; 树的深度不增加
            {
                var TmpBTreeNode = new Array();
                TmpBTreeNode.push(newArrayLists[i]);//B

                var preContainer = R2ArrayLists[BTreeDeep-1];
                preContainer[1] = TmpBTreeNode;
            }
            else  //结束时间不同(已排序)，分裂为A+B/B
            {
                var TmpBTreeNode = new Array();
                TmpBTreeNode.push(newArrayLists[i]);//B

                var preContainer = R2ArrayLists[BTreeDeep-1];
                preContainer[0].push(newArrayLists[i]);//A+B
                
                preContainer[1] = TmpBTreeNode; //B
                
                //document.getElementById("Output").innerHTML += "</br>"+"比较 开始时间相同，结束不同";

            }
        }
        else
        {
            if (time3 == time4) //开始时间不同，结束时间相同，分裂为A+B/B or A/A+B?
            {
//                var TmpBTreeNode = new Array();
//                TmpBTreeNode.push(newArrayLists[i]);//B
//                
//                var preContainer = R2ArrayLists[BTreeDeep-1];
//                preContainer[0].push(newArrayLists[i]);//A+B
//                
//                preContainer[1] = TmpBTreeNode; //B
                
                var TmpBTreeNode = new Array();
                TmpBTreeNode.push(newArrayLists[i-1]);//A
                TmpBTreeNode.push(newArrayLists[i]);//B
                
                var preContainer = R2ArrayLists[BTreeDeep-1];
//                preContainer[0].push(newArrayLists[i]);//A+B
                
                preContainer[1] = TmpBTreeNode; //B
                
                //document.getElementById("Output").innerHTML += "</br>"+"比较 结束时间相同";

            }
            else    //正常，不用分裂 +A
            {
                BTreeDeep++;
                var TmpBTreeContainer = new Array();
                var TmpBTreeNode = new Array();
                TmpBTreeNode.push(newArrayLists[i]);//A
                TmpBTreeContainer[0] = TmpBTreeNode;
                R2ArrayLists[BTreeDeep-1] = TmpBTreeContainer;
            }
        }
    }
    
    //document.getElementById("Output").innerHTML += "</br>"+"拼接后层数:"+BTreeDeep;

    var routeCnt = 1;
    for (var i=0; i<BTreeDeep; i++) //计算可能的路径数目
    {
        var nodeContainer = R2ArrayLists[i];
        var nodeCnt = nodeContainer.length;
        routeCnt = routeCnt * nodeCnt;
        
        //document.getElementById("Output").innerHTML += "</br>"+"层/节点数:"+i+"/"+nodeCnt;

    }
    
    var routesArray = new Array();
    for (var i=0; i<routeCnt;i++)       
    {
        var routesContainer = new Array();
        routesArray[i] = routesContainer;
    }
    

    
    for (var i=0; i<BTreeDeep; i++)              //每层
    {
        var nodeContainer = R2ArrayLists[i];


        var MODNUM = 1;
        if (nodeContainer.length > 1)
        {
            MODNUM=2;
        }
        else
        {
            MODNUM=1;
        }

        for (var j=0; j<nodeContainer.length;j++) //每层有多少个节点
        {
            var nodePnt = nodeContainer[j];
            
            var CMPNUM = 0;
            if (j==0)
            {
                CMPNUM=0;
            }
            else
            {
                CMPNUM=1;
            }
            for (var k=0; k<nodePnt.length; k++)  //每个节点里头的内容
            {
                var tmpSegList = nodePnt[k];
                
                for (var l=0; l<routeCnt;l++)       //每条可能的路径
                {
                    if (l%MODNUM == CMPNUM)
                    {
                        routesArray[l].push(tmpSegList);
                    }
                }

            }

        }
    
    }
    
    
    gRoutesArray = routesArray;
    //document.getElementById("Output").innerHTML = "";
    
    
//    for (var i=0; i<routeCnt;i++)
//    {
//        var routesContainer = gRoutesArray[i];
//        var segCnt = routesContainer.length;        
//        //document.getElementById("Output").innerHTML += "</br><p   onclick=\"TestAction()\"> 可能路线--》点击我 </p>";
//        
//        document.getElementById("RouteList").innerHTML += "<div onclick=\"DisplayRoute("+i+")\"> 可能路线"+i+"，经过路段:";
//        for (var j=0; j<segCnt; j++)
//        {
//            var segment = routesContainer[j];
//
//            document.getElementById("RouteList").innerHTML += segment[0].roadNames[0] + ";";
//
//        }
//        document.getElementById("RouteList").innerHTML += " </div>";
//
//    }

}

showRouteList = function()
{
    routeCnt = gRoutesArray.length;
    
    document.getElementById("RouteList").innerHTML = "";

    for (var i=0; i<routeCnt;i++)
    {
        var routesContainer = gRoutesArray[i];
        var segCnt = routesContainer.length;
        
        var trstCmp = gSegTrust[i]*100.0;
        var trustvalue = trstCmp.toFixed(2);
        //document.getElementById("RouteList").innerHTML += "<div onclick=\"DisplayRoute("+i+")\"> 可能路线 "+i+", 可信度:"+trustvalue+"%，经过路段:";
        document.getElementById("RouteList").innerHTML += "<div onclick=\"DisplayRoute("+i+")\"> 可能路线 "+i+"，可能经过路段:";

        for (var j=0; j<segCnt; j++)
        {
            var segment = routesContainer[j];
            
            document.getElementById("RouteList").innerHTML += segment[0].roadNames[0] + ";";
            
            
            for (var k=0; k<segment.length;k++)
            {
                var btspoint = new BMap.Point(segment[k].lng, segment[k].lat);
                var btscircle = new BMap.Circle(btspoint,segment[k].raid*1000);
                btscircle.setFillOpacity(0.2);
                map.addOverlay(btscircle);
            }

            
        }
        document.getElementById("RouteList").innerHTML += " </div>";
        
    }
    
    segIndex = 0;
    segPntIndex = 0;
    //RouteNextSegment();

}


CaculateTrusted = function()
{
    gSegTrust.splice(0);
    
    routeCnt = gRoutesArray.length;
    
    for (var i=0; i<routeCnt;i++)
    {
        var routesContainer = gRoutesArray[i];
        var segCnt = routesContainer.length;
        
        var TotalPointCnt = 0;
        for (var j=0; j<segCnt; j++)
        {
            TotalPointCnt += routesContainer[j].length;
        }
        
        var SegVarianceList = new Array();
        var SegVarianceCnt = 0.0;
        
        for (var j=0; j<segCnt; j++)
        {
            var segment = routesContainer[j];
            var segRoadName = segment[0].roadNames[0];
            
            var pathPointList;
            if (segRoadName == "环城高速东侧 北向") //0
            {
                pathPointList = gPathArray[0];
            }
            if (segRoadName == "环城高速东侧 南向") //4
            {
                pathPointList = gPathArray[4];
            }
            if (segRoadName == "环城高速北侧 北向") //1
            {
                pathPointList = gPathArray[1];
            }
            if (segRoadName == "环城高速北侧 南向") //5
            {
                pathPointList = gPathArray[5];
            }
            if (segRoadName == "成渝高速 东向")   //2
            {
                pathPointList = gPathArray[2];
            }
            if (segRoadName == "成渝高速 西向")   //6
            {
                pathPointList = gPathArray[6];
            }
            if (segRoadName == "机场高速 北向") //3
            {
                pathPointList = gPathArray[3];
            }
            if (segRoadName == "机场高速 南向") //7
            {
                pathPointList = gPathArray[7];
            }

            var totalDist = 0;
            for (var k=0; k<segment.length;k++)
            {
                var btspoint = new BMap.Point(segment[k].lng, segment[k].lat);
                var retDistInfo = getNearestDistanceOfRoad(btspoint, pathPointList);
                totalDist += retDistInfo.distance;
                
                segment[k].roadIndex[0] = retDistInfo.index;
            }
            
            //平均距离偏差
            var avgDistance = totalDist/segment.length;
            var TrustDist = (2000 - avgDistance)/2000.0;
            
            if (TotalPointCnt < 10)
            {
                TotalPointCnt = 10;
            }
            //契合点数的偏差
            //var TrustPointCnt = (TotalPointCnt - segment.length)/(TotalPointCnt*1.0);
            var TrustPointCnt = (segment.length-3)/10.0;//(TotalPointCnt*1.0);
            TrustPointCnt = (TrustPointCnt*0.3)+0.7;
            
            //时间离散度
            
            //序列
            
            var Variance = Math.sqrt( (TrustDist*TrustDist + TrustPointCnt*TrustPointCnt)/2.0 );
            SegVarianceList.push(Variance);
            SegVarianceCnt += Variance;
            
            //document.getElementById('Output').innerHTML += "</br>" + TrustDist +"*****"+ TrustPointCnt+":Result"+Variance;

        }
        
        var AvgSegVariance = (SegVarianceCnt*1.0)/segCnt;

        var SegSqrtCnt = 0.0;
        for (var j=0; j<segCnt; j++)
        {
            SegSqrtCnt += (SegVarianceList[j]-AvgSegVariance)*(SegVarianceList[j]-AvgSegVariance);
        }
        
        var SegTrust =  Math.sqrt(SegSqrtCnt/segCnt);
        
        var AvgSegVariancewithSQT = ((1.0-SegTrust)+AvgSegVariance)/2.0;
        
        //gSegTrust.push(SegTrust);
        gSegTrust.push(AvgSegVariancewithSQT);
        
        //document.getElementById('Output').innerHTML += "</br> =========SegTurst:" + AvgSegVariancewithSQT;
        
    }
    

}

GetResult = function()
{
    SplitDataSegmentWithRoad();
    SplitDataSegment();
    SplitDataSegmentbyTime();
    ClearDataFrequency();
    ClearDataPingpong();
    ClearDataSignal();
    DirectionMatchAndClear();
    MergePaths();
    CaculateTrusted();
    
    showRouteList();
}

