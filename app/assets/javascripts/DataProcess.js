

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
    
    
    if (p1.lng < p2.lng)
    {
        if ((dSPtLng < p1.lng) || (dSPtLng > p2.lng))
        {
            retinline = 0;
        }
    }
    else
    {
        if ((dSPtLng > p1.lng) || (dSPtLng < p2.lng))
        {
            retinline = 0;
        }
    }
    
    if (p1.lat < p2.lat) 
    {
        if ((dSPtLat < p1.lat) || (dSPtLat > p2.lat)) 
        {
            retinline = 0;
        }
    }
    else
    {
        if ((dSPtLat > p1.lat) || (dSPtLat < p2.lat))
        {
            retinline = 0;
        }
    }
    
    retdst = map.getDistance(pnt, retpnt);
    
    var retInfo = new DistInfo(retpnt, retdst, retinline, 0);
    return retInfo;
};

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


function  GetCenterPoint(bts1, bts2)
{
    var diffLng = (bts2.lng*1.0 - bts1.lng*1.0);
    var diffLat = (bts2.lat*1.0 - bts1.lat*1.0);

    var ratio = bts2.raid/(bts2.raid*1.0+bts1.raid*1.0);
    
    var newLng = bts2.lng*1.0 - diffLng*ratio;
    var newLat = bts2.lat*1.0 - diffLat*ratio;

    var retPoint = new LYPoint(newLng, newLat);
    return  retPoint;
}


SplitDataSegment = function()
{
    
    if (gTempSegmentArray.length == 0)
    {
        alert("aaa位置更新数据尚未加载");
    }
    else
    {
        var newLists = new Array();
        
        for (var i=0; i<gTempSegmentArray.length; i++)
        {
            var tmpList = gTempSegmentArray[i];
            
            var breakList = splitSegment(tmpList);
            for (var j=0; j < breakList.length; j++)// breakseg in breakList)
            {
                var breakseg = breakList[j];
                newLists.push(breakseg);
            }
        }
        
        gTempSegmentArray = newLists;
    }
    
}


function splitSegment(luInfoArray)
{
    segIndex = 0;
    
    var segmentArray = new Array();
    var tempLuList = new Array();
    
    var rangeAccuracy = 4;

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
    if (gTempSegmentArray.length == 0)
    {
        alert("位置更新数据尚未加载");
    }
    else
    {
        var newLists = new Array();
        
        for (var i=0; i<gTempSegmentArray.length; i++)
        {
            var tmpList = gTempSegmentArray[i];
            
            var breakList = splitSegmentByTime(tmpList);
            for (var j=0; j < breakList.length; j++)
            {
                var breakseg = breakList[j];
                newLists.push(breakseg);
            }
        }
        
        gTempSegmentArray = newLists;
    }

    
}

//这段代码可能有点问题
function splitSegmentByTime(luInfoArray)
{
    segIndex = 0;
    
    var segmentArray = new Array();
    var tempLuList = new Array();
    
    var timeAccuracy = 15 * 60; 

    
    for (var i=0; i<luInfoArray.length; i++)
    {
        
        if (tempLuList.length > 0)
        {
            var segmentIndex = tempLuList.length - 1;
            
            var time1 = new Date(luInfoArray[i].time);
            var time2 = new Date(tempLuList[segmentIndex].time);
            var timediff = Math.abs(time1.getTime() - time2.getTime())/1000; 
            
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
    for (var i=0; i<gTempSegmentArray.length; i++)
    {
        var oldArray = gTempSegmentArray[i];
        var newArray = clear900(oldArray);
        var deletedItemCnt = oldArray.length - newArray.length;
        cnt += deletedItemCnt;
        if (newArray.length != oldArray.length)
        {
            gTempSegmentArray.splice(i, 1, newArray);
        }
    }
    segIndex = 0;
    
}

function clear900(luInfoArray)
{
    
    var tempLuList = new Array();
    
    for (var i=0; i<luInfoArray.length; i++)
    {
        
        if (tempLuList.length > 0)
        {
            var segmentIndex = tempLuList.length - 1;
            var point1 = new BMap.Point(luInfoArray[i].lng, luInfoArray[i].lat);
            var point2 = new BMap.Point(tempLuList[segmentIndex].lng, tempLuList[segmentIndex].lat);
            var distance = map.getDistance(point1, point2);
            
            
            if (luInfoArray[i].raid == 4) 
            {
                if ( i>1 && ((luInfoArray.length-i)>1) )
                {
                    var pntPreCell = new BMap.Point(luInfoArray[i-1].lng, luInfoArray[i-1].lat);
                    var pntThisCell = new BMap.Point(luInfoArray[i].lng, luInfoArray[i].lat);
                    var pntNextCell = new BMap.Point(luInfoArray[i+1].lng, luInfoArray[i+1].lat);
                    var RadiusthisCell = luInfoArray[i].raid*1000.0;
                    
                    var Dist1 = map.getDistance(pntPreCell, pntThisCell);
                    var maxDistL1 = Dist1*1 + luInfoArray[i-1].raid*1000.0;                    
                    if (maxDistL1 < RadiusthisCell)
                    {
                        var Dist2 = map.getDistance(pntNextCell, pntThisCell);
                        var maxDistL2 = Dist2*1 + luInfoArray[i+1].raid*1000.0;                        
                        if (maxDistL2 < RadiusthisCell)
                        {
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
    for (var i=0; i<gTempSegmentArray.length; i++)
    {
        var oldArray = gTempSegmentArray[i];
        var newArray = clearPingPong(oldArray);
        var deletedItemCnt = oldArray.length - newArray.length;
        cnt += deletedItemCnt;
        
        if (newArray.length != oldArray.length)
        {
            gTempSegmentArray.splice(i, 1, newArray);
        }
    }
    
    
    segIndex = 0;
}



function clearPingPong(luInfoArray)
{
    
    var tempLuList = new Array();
    
    for (var i=0; i<luInfoArray.length; i++)
    {
        if ((luInfoArray.length-i) > 2)
        {
            if ((luInfoArray[i].cellid == luInfoArray[i+1].cellid)
                || (luInfoArray[i].cellid == luInfoArray[i+2].cellid))
            {
                var time1 = new Date(luInfoArray[i].time);
                var time3 = new Date(luInfoArray[i+2].time);
                var timediff = Math.abs(time3.getTime() - time1.getTime())/1000;
                
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
    for (var i=0; i<gTempSegmentArray.length; i++)
    {
        var oldArray = gTempSegmentArray[i];
        var newArray = clearSignal(oldArray);
        var deletedItemCnt = oldArray.length - newArray.length;
        cnt += deletedItemCnt;
        
        if (newArray.length != oldArray.length)
        {
            gTempSegmentArray.splice(i, 1, newArray);
        }
    }
    
    
    segIndex = 0;
    
    
}

function clearSignal(tempLuList)
{
    var ran2List = new Array();
    
    for (var i=0; i<tempLuList.length; i++)
    {
        if ((i > 0) && (tempLuList.length-i) > 1)
        {
            var time1 = new Date(tempLuList[i].time);
            var time2 = new Date(tempLuList[i+1].time);
            var timediff = Math.abs(time2.getTime() - time1.getTime())/1000;
            
            if (timediff < 30)
            {
                continue;
            }
            
        }
        ran2List.push(tempLuList[i]);
    }
    
    return ran2List;
}


SplitDataSegmentWithRoad = function()
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
            
            var breakList = segmentwithRoad(tmpList);
            
            for (var j=0; j < breakList.length; j++)
            {
                var breakseg = breakList[j];
                newLists.push(breakseg);
            }
        }
        
        gTempSegmentArray = newLists;
    }
}


function segmentwithRoad(luInfoArray)
{
    
    var segmentList = new Array();
    var breakIndex = 0;
    
    for (var i=0; i<luInfoArray.length; i++)
    {        
        for (var jjjk=0;  jjjk< luInfoArray[i].roadNames.length; jjjk++)
        {
            var printname = luInfoArray[i].roadNames[jjjk];
        }
        
        if (segmentList.length == 0)
        {
            if ((luInfoArray.length - i) > 1) 
            {
                for (var nameIdx=0;  nameIdx< luInfoArray[i].roadNames.length; nameIdx++)
                {
                    var thisName = luInfoArray[i].roadNames[nameIdx];
                    
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
                    
                    if (isFound1==1)// && isFound2==1)
                    {
                        var newList = new RoadInfo(thisName);
                        var newTmpPushPnt = new LocationUpdateInfo(luInfoArray[i].time,luInfoArray[i].phonenumber,luInfoArray[i].cellid);
                        newTmpPushPnt.lng=luInfoArray[i].lng;
                        newTmpPushPnt.lat=luInfoArray[i].lat;
                        newTmpPushPnt.raid=luInfoArray[i].raid;
                        newTmpPushPnt.roadNames = new Array();
                        newTmpPushPnt.roadIndex = new Array();
                        newTmpPushPnt.switchIndex = luInfoArray[i].switchIndex;
                        
                        for (var tii = 0; tii< luInfoArray[i].roadNames.length; tii++)
                        {
                            newTmpPushPnt.roadNames.push(luInfoArray[i].roadNames[tii]);
                        }
                        
                        for (var tii = 0; tii< luInfoArray[i].roadIndex.length; tii++)
                        {
                            newTmpPushPnt.roadIndex.push(luInfoArray[i].roadIndex[tii]);
                        }
                        
                        newList.pointList.push(newTmpPushPnt);
                        
                        segmentList.push(newList);
                    }
                    else
                    {
                    }
                    
                }
            }
            else
            {
            }
        }
        else
        {
            for (var nameIdx=0;  nameIdx< luInfoArray[i].roadNames.length; nameIdx++)
            {
                var thisName = luInfoArray[i].roadNames[nameIdx];
                
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
                        newTmpPushPnt.switchIndex = luInfoArray[i].switchIndex;

                        
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
                        
                        if (isFound1==1)// && isFound2==1)
                        {
                            var newList = new RoadInfo(thisName);
                            var newTmpPushPnt = new LocationUpdateInfo(luInfoArray[i].time,luInfoArray[i].phonenumber,luInfoArray[i].cellid);
                            newTmpPushPnt.lng=luInfoArray[i].lng;
                            newTmpPushPnt.lat=luInfoArray[i].lat;
                            newTmpPushPnt.raid=luInfoArray[i].raid;
                            newTmpPushPnt.roadNames = new Array();
                            newTmpPushPnt.roadIndex = new Array();
                            newTmpPushPnt.switchIndex = luInfoArray[i].switchIndex;

                            
                            for (var tii = 0; tii< luInfoArray[i].roadNames.length; tii++)
                            {
                                newTmpPushPnt.roadNames.push(luInfoArray[i].roadNames[tii]);
                            }
                            
                            for (var tii = 0; tii< luInfoArray[i].roadIndex.length; tii++)
                            {
                                newTmpPushPnt.roadIndex.push(luInfoArray[i].roadIndex[tii]);
                            }
                            newList.pointList.push(newTmpPushPnt);

                            segmentList.push(newList);
                            breakIndex = i;
                            
                        }
                    }
                }
            }
        }
    }
    
    
    
    var retLists = new Array();
    
    for (var si=0; si<segmentList.length; si++)
    {
        var tmpseg = segmentList[si];
        for (var pi=0;pi<tmpseg.pointList.length;pi++)
        {
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
    if (gTempSegmentArray.length == 0)
    {
        alert("位置更新数据尚未加载");
    }
    else
    {
        var newLists = new Array();
        
        for (var i=0; i<gTempSegmentArray.length; i++)
        {
            var tmpList = gTempSegmentArray[i];
            
            var breakList = segmentwithDirection(tmpList);
            for (var j=0; j < breakList.length; j++)
            {
                var breakseg = breakList[j];
                newLists.push(breakseg);
            }
        }
        
        gTempSegmentArray = newLists;
    }    
}


function segmentwithDirection(luInfoArray)
{
    
    segIndex = 0;
    
    var segmentArray = new Array();
    var tempLuList = new Array();
    
    
    if (luInfoArray.length < 3)
    {
        var newList = new Array();
        
        for (var i=0; i<luInfoArray.length; i++)
        {
            var newTmpPushPnt = new LocationUpdateInfo(luInfoArray[i].time,luInfoArray[i].phonenumber,luInfoArray[i].cellid);
            newTmpPushPnt.lng=luInfoArray[i].lng;
            newTmpPushPnt.lat=luInfoArray[i].lat;
            newTmpPushPnt.raid=luInfoArray[i].raid;
            newTmpPushPnt.roadNames = new Array();
            newTmpPushPnt.roadIndex = new Array();
            newTmpPushPnt.switchIndex = luInfoArray[i].switchIndex;

            
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
    
    tempLuList.push(luInfoArray[0]);
    tempLuList.push(luInfoArray[1]);

    var preIndexDiff = luInfoArray[1].roadIndex[0] - luInfoArray[0].roadIndex[0];

    for (var i=2; i<luInfoArray.length; i++)
    {
        
        var segmentIndex = tempLuList.length - 1;
        
        var currentIndex = luInfoArray[i].roadIndex[0]-tempLuList[segmentIndex].roadIndex[0];
        
        var direction;

        if (preIndexDiff == 0)
        {
            tempLuList.push(luInfoArray[i]);
        }
        else
        {
            direction = currentIndex/preIndexDiff;
            
            if (direction < 0)
            {
                if ((luInfoArray.length - i) > 1)  
                {
                    var nextIndexDiff = luInfoArray[i+1].roadIndex[0]-tempLuList[segmentIndex].roadIndex[0];
                    var nextDirection = nextIndexDiff/preIndexDiff;
                    
                    if (nextDirection < 0) 
                    {
                        segmentArray.push(tempLuList);
                        var tempLuList = new Array();
                        tempLuList.push(luInfoArray[i-1].Clone()); 
                        tempLuList.push(luInfoArray[i]);
                    }
                    else
                    {
                        tempLuList.push(luInfoArray[i]);

                    }
                }
                else
                {

                    segmentArray.push(tempLuList);
                    var tempLuList = new Array();
                    tempLuList.push(luInfoArray[i-1].Clone()); 
                    tempLuList.push(luInfoArray[i]);
                }
            }
            else
            {
                tempLuList.push(luInfoArray[i]);
            }
        }
        
        preIndexDiff = currentIndex;

        if (i==(luInfoArray.length-1))
        {
            segmentArray.push(tempLuList);
        }
        
    }
    
    return segmentArray;
    
}


GetRouteDirection = function ()
{
    
    var newArrayLists = new Array();
    
    for (var i=0; i<gTempSegmentArray.length; i++)
    {
        var tmpList = gTempSegmentArray[i];
        
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

    if (gTempSegmentArray.length == 0)
    {
        alert("位置更新数据尚未加载");
        return;
    }
    
    GetRouteDirection();
    
    if (gTempSegmentArray.length == 1) 
    {
        var routesArray = new Array();
        var routesContainer = new Array();
        routesContainer.push(gTempSegmentArray[0]);
        routesArray[0] = routesContainer;
        gRoutesArray = routesArray;
        
        return;
    }
    
    var newArrayLists = new Array();

    
    for (var i=0; i<gTempSegmentArray.length; i++)
    {
        var tmpList = new Array();
        tmpList = gTempSegmentArray[i];

        if (newArrayLists.length > 0)
        {
            var time1 = new Date(tmpList[0].time);
            var ArCnt = newArrayLists.length;

            var isFound = 0;
            for (var j=0; j<ArCnt; j++)
            {
                var preArray = newArrayLists[j];
                var time2 = new Date(preArray[0].time);
                
                if (time1.getTime() == time2.getTime()) 
                {
                    var time3 = new Date(tmpList[tmpList.length-1].time);
                    var time4 = new Date(preArray[preArray.length-1].time);
                    if (time3.getTime() >= time4.getTime())
                    {
                        newArrayLists.splice(j+1,0,tmpList);  
                    }
                    else
                    {
                        newArrayLists.splice(j,0,tmpList);    
                    }
                    isFound = 1;
                    break;
                }
                else
                {
                    if (time1.getTime() > time2.getTime())
                    {
                    }
                    else
                    {
                        newArrayLists.splice(j,0,tmpList); 
                        isFound = 1;
                        break;
                    }
                }
            }
            
            if (isFound == 0) 
            {
                newArrayLists.push(tmpList);
            }
            
        }
        else
        {
            newArrayLists.push(tmpList);
        }
    }
    

    var R2ArrayLists = new Array();
    var TmpBTreeContainer = new Array();
    var TmpBTreeNode = new Array();
    TmpBTreeNode.push(newArrayLists[0]);//A
    TmpBTreeContainer[0] = TmpBTreeNode;
    R2ArrayLists[0] = TmpBTreeContainer;
    
    var BTreeDeep = 1;
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



        
        if (time1 == time2) 
        {

            if (time3 == time4) 
            {
                var TmpBTreeNode = new Array();
                TmpBTreeNode.push(newArrayLists[i]);

                var preContainer = R2ArrayLists[BTreeDeep-1];
                preContainer[1] = TmpBTreeNode;
            }
            else  
            {
                var TmpBTreeNode = new Array();
                TmpBTreeNode.push(newArrayLists[i]);

                var preContainer = R2ArrayLists[BTreeDeep-1];
                preContainer[0].push(newArrayLists[i]);
                
                preContainer[1] = TmpBTreeNode; 
            }
        }
        else
        {
            if (time3 == time4) 
            {                
                var TmpBTreeNode = new Array();
                TmpBTreeNode.push(newArrayLists[i-1]);
                TmpBTreeNode.push(newArrayLists[i]);
                
                var preContainer = R2ArrayLists[BTreeDeep-1];
                
                preContainer[1] = TmpBTreeNode; 
                
            }
            else   
            {
                BTreeDeep++;
                var TmpBTreeContainer = new Array();
                var TmpBTreeNode = new Array();
                TmpBTreeNode.push(newArrayLists[i]);
                TmpBTreeContainer[0] = TmpBTreeNode;
                R2ArrayLists[BTreeDeep-1] = TmpBTreeContainer;
            }
        }
    }
    

    var routeCnt = 1;
    for (var i=0; i<BTreeDeep; i++) 
    {
        var nodeContainer = R2ArrayLists[i];
        var nodeCnt = nodeContainer.length;
        routeCnt = routeCnt * nodeCnt;
        

    }
    
    var routesArray = new Array();
    for (var i=0; i<routeCnt;i++)       
    {
        var routesContainer = new Array();
        routesArray[i] = routesContainer;
    }
    

    
    for (var i=0; i<BTreeDeep; i++)              
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

        for (var j=0; j<nodeContainer.length;j++) 
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
            for (var k=0; k<nodePnt.length; k++)  
            {
                var tmpSegList = nodePnt[k];
                
                for (var l=0; l<routeCnt;l++)       
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
        document.getElementById("RouteList").innerHTML += "<div onclick=\"DisplayRoute("+i+")\"> 可能路线 "+i+", 可信度:"+trustvalue+"%，经过路段:";

        var aPotentialLink = new PathLink();
        aPotentialLink.trustValue = trustvalue;
        
        var segmentInfoList = new Array();
        
        for (var j=0; j<segCnt; j++)
        {
            var segmentPoints = routesContainer[j];
            
            var aSegmentInfoItem = new SegmentInfo();
            aSegmentInfoItem.rdName = segmentPoints[0].roadNames[0];
            aSegmentInfoItem.lacList = segmentPoints;
            
            segmentInfoList.push(aSegmentInfoItem);
            
            document.getElementById("RouteList").innerHTML += segmentPoints[0].roadNames[0] + ";";
            
            
            for (var k=0; k<segmentPoints.length;k++)
            {
                var btspoint = new BMap.Point(segmentPoints[k].lng, segmentPoints[k].lat);
                var btscircle = new BMap.Circle(btspoint,segmentPoints[k].raid*1000);
                btscircle.setFillOpacity(0.2);
                map.addOverlay(btscircle);
            }

            
        }
        document.getElementById("RouteList").innerHTML += " </div>";
        
        aPotentialLink.segmentInfoList =  segmentInfoList;
        
        gPotentialPathLinks.push(aPotentialLink);
        
    }
    
    
    segIndex = 0;
    segPntIndex = 0;

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
            var segmentPoints = routesContainer[j];
            var segRoadName = segmentPoints[0].roadNames[0];
            
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
            for (var k=0; k<segmentPoints.length;k++)
            {
                var btspoint = new BMap.Point(segmentPoints[k].lng, segmentPoints[k].lat);
                var retDistInfo = getNearestDistanceOfRoad(btspoint, pathPointList);
                totalDist += retDistInfo.distance;
                
                segmentPoints[k].roadIndex[0] = retDistInfo.index;
            }
            
            var avgDistance = totalDist/segmentPoints.length;
            var TrustDist = (2000 - avgDistance)/2000.0;
            
            if (TotalPointCnt < 10)
            {
                TotalPointCnt = 10;
            }
            var TrustPointCnt = (segmentPoints.length-3)/10.0;//(TotalPointCnt*1.0);
            TrustPointCnt = (TrustPointCnt*0.3)+0.7;
            
            
            
            var Variance = Math.sqrt( (TrustDist*TrustDist + TrustPointCnt*TrustPointCnt)/2.0 );
            SegVarianceList.push(Variance);
            SegVarianceCnt += Variance;
            

        }
        
        var AvgSegVariance = (SegVarianceCnt*1.0)/segCnt;

        var SegSqrtCnt = 0.0;
        for (var j=0; j<segCnt; j++)
        {
            SegSqrtCnt += (SegVarianceList[j]-AvgSegVariance)*(SegVarianceList[j]-AvgSegVariance);
        }
        
        var SegTrust =  Math.sqrt(SegSqrtCnt/segCnt);
        
        var AvgSegVariancewithSQT = ((1.0-SegTrust)+AvgSegVariance)/2.0;
        
        gSegTrust.push(AvgSegVariancewithSQT);
        
        
    }
    

}


CaculateSpeed = function()
{
    
    var pathLinksCnt = gPotentialPathLinks.length;
    
    var orgLacList = gSegmentArray[0];
    
    for (var i=0; i< pathLinksCnt; i++)
    {
        
        var segmentList = gPotentialPathLinks[i].segmentInfoList;
        segCnt = segmentList.length;
        
        for (var j = 0; j<segCnt; j++)
        {
            
            var pointArray = segmentList[j].lacList;
            var pntCnt = pointArray.length;
            
            if (pntCnt < 3)
            {
                continue;
            }
            
            
            for (var k=0; k<(pntCnt-1);k++)
            {
                var centerPoint1;
                

                if (pointArray[k].switchIndex < 1)
                {
                    continue;
                }
                else 
                {
                    var curIndex = pointArray[k].switchIndex;
                    var point1 = new BMap.Point(orgLacList[curIndex-1].lng, orgLacList[curIndex-1].lat);
                    var point2 = new BMap.Point(pointArray[k].lng, pointArray[k].lat);
                    var distance = map.getDistance(point1, point2);

                    var radiusRange = (orgLacList[curIndex-1].raid*1.0 + pointArray[k].raid*1.0)*1000.0;
                    rangeAccuracy = 1; 
                    if (k==0 && distance > (radiusRange + rangeAccuracy*1000.0))
                    {
                        continue;
                    }
                    else
                    {
                        centerPoint1 = GetCenterPoint(orgLacList[curIndex-1], pointArray[k]);
                        
                    }
                }
                
                var time1 = new Date(pointArray[k].time);
                var time2 = new Date(pointArray[k+1].time);
                var timediff = Math.abs(time1.getTime() - time2.getTime())/1000; 
                
                var curIndex = pointArray[k+1].switchIndex;

                var centerPoint2 = GetCenterPoint(orgLacList[curIndex-1], pointArray[k+1]);
                

                var point1 = new BMap.Point(centerPoint1.lng, centerPoint1.lat);
                var point2 = new BMap.Point(centerPoint2.lng, centerPoint2.lat);
                var distance = map.getDistance(point1, point2);

                

                
                var speed = (distance/timediff)*3600.0/1000.0 * 1.2;
                
                var speedInfoItem  = new SpeedInfo();
                speedInfoItem.speed = speed;
                speedInfoItem.stLng = point1.lng;
                speedInfoItem.stLat = point1.lat;
                speedInfoItem.edLng = point2.lng;
                speedInfoItem.edLat = point2.lat;
                var stDT = new Date(pointArray[k].time);    
                speedInfoItem.stTime = stDT.getTime()/1000;
                var edDT = new Date(pointArray[k+1].time);   
                speedInfoItem.edTime = edDT.getTime()/1000;

                segmentList[j].speedList.push(speedInfoItem);
            }
        }

    }
    
}


function getRoadPointsbyName(segRoadName)
{
    var pathPointList = new Array();
    //var retRoadID = 0;
    
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

    return pathPointList;
    
}



function getRoadSegPointsByStartEnd(startPoint, endPoint, rdName)
{
    var pathPointList = getRoadPointsbyName(rdName);
    
    var stDistInfo = getNearestDistanceOfRoad(startPoint, pathPointList);

    var edDistInfo = getNearestDistanceOfRoad(endPoint, pathPointList);
    
    var retPointList = new Array;
    
    retPointList.push(stDistInfo.projection);
    for (var i=stDistInfo.index; i<=edDistInfo.index; i++)
    {
        retPointList.push(pathPointList[i]);
    }
    
    retPointList.push(edDistInfo.projection);
    return retPointList;
}

function getRoadSegTraffInfoByStartEnd(startPoint, endPoint, rdName)
{
    var pathPointList = getRoadPointsbyName(rdName);
    
    var stDistInfo = getNearestDistanceOfRoad(startPoint, pathPointList);
    
    var edDistInfo = getNearestDistanceOfRoad(endPoint, pathPointList);
    
    var retPointList = new Array;
    
    retPointList.push(stDistInfo.projection);
    for (var i=stDistInfo.index; i<=edDistInfo.index; i++)
    {
        retPointList.push(pathPointList[i]);
    }
    
    retPointList.push(edDistInfo.projection);
    
    
    var retTrfInfo = new RetTrfficInfo();
    retTrfInfo.rdPointList = retPointList;
    retTrfInfo.stIndex = stDistInfo.index;
    retTrfInfo.edIndex = edDistInfo.index;

    return retTrfInfo;
}

function pushSpeedSeg(rdName, segInfo)
{
    var pathCnt = gPathTraffic.length;
    var pathIndex=-1;
    for (var i=0; i<pathCnt; i++)
    {
        if (rdName == gPathTraffic[i].rdName)
        {
            pathIndex = i;
        }
    }
    
    if (pathIndex < 0)
    {
        var newPathTrf = new PathTraffic();
        newPathTrf.rdName = rdName;
        
        var periodItem = new SegTrafficInPeriod();
        periodItem.periodBegin = segInfo.stTime - segInfo.stTime%1800;
        periodItem.segTrafficList.push(segInfo);
        
        newPathTrf.TraffPeriodList.push(periodItem);
        
        gPathTraffic.push(newPathTrf);

        return;
    }
    
    var periodList = gPathTraffic[pathIndex].TraffPeriodList;
    
    var PeriodCnt = periodList.length;
    
    var isPeriodFound = 0;
    for (var i=0; i<PeriodCnt; i++)
    {
        var time1 = periodList[i].periodBegin;
        var time2 = segInfo.stTime;
        var timediff = time2 - time1; 
        
        if (timediff >= 0 && timediff < 1800) 
        {
            isPeriodFound = 1;
            var itmpSegCnt = periodList[i].segTrafficList.length;
            
            for (var j=0; j<itmpSegCnt; j++)
            {
                var tmpSegInfo = periodList[i].segTrafficList[j];
                if (tmpSegInfo.stIndex == segInfo.stIndex)
                {
                    var newSpeed = (periodList[i].segTrafficList[j].speed*periodList[i].segTrafficList[j].count + segInfo.speed)/(periodList[i].segTrafficList[j].count+1);
                    periodList[i].segTrafficList[j].count++;
                    periodList[i].segTrafficList[j].speed = newSpeed;
                    break;
                }
                else if(tmpSegInfo.stIndex > segInfo.stIndex) 
                {
                    periodList[i].segTrafficList.splice(j, 0, segInfo); 
                    break;
                }
                else if (j == (itmpSegCnt-1))
                {
                    periodList[i].segTrafficList.push(segInfo); 
                }
            }
            
        }
        
    }
    
    if (isPeriodFound == 0)
    {
        var periodItem = new SegTrafficInPeriod();
        periodItem.periodBegin = segInfo.stTime - segInfo.stTime%1800;
        periodItem.segTrafficList.push(segInfo);
        
        periodList.push(periodItem);
    }
    
    
    
}


function staticSpeedInfo()
{
    
    var rndCnt = gPotentialPathLinks.length;
    var maxTrust = -1.0;
    var maxTrustRdIndex = 0;
    for (var i=0; i<rndCnt; i++)
    {
        if (maxTrust < gPotentialPathLinks[i].trustValue)
        {
            maxTrust = gPotentialPathLinks[i].trustValue;
            maxTrustRdIndex = i;
        }
    }
    
    var segmentList = gPotentialPathLinks[maxTrustRdIndex].segmentInfoList;
    
    var segCnt = segmentList.length;
    
    for (var i=0; i<segCnt; i++)
    {
        var speedArray = segmentList[i].speedList;
        
        if (!speedArray && speedArray.length<=0)
        {
            continue;
        }
        
        for (var j=0; j<speedArray.length;j++)
        {
            var stMapPoint = new BMap.Point(speedArray[j].stLng, speedArray[j].stLat);
            var edMapPoint = new BMap.Point(speedArray[j].edLng, speedArray[j].edLat);
            
            var SpInfo = getRoadSegTraffInfoByStartEnd(stMapPoint, edMapPoint, segmentList[i].rdName);
            
                    
            var indexCnt = SpInfo.edIndex-SpInfo.stIndex;
            
            for (var k=SpInfo.stIndex; k<=SpInfo.edIndex; k++)
            {
                var trafficItem = new SegTraffic();
                trafficItem.stIndex = k;
                trafficItem.edIndex = k+1;
                trafficItem.speed = speedArray[j].speed;
                trafficItem.stTime = speedArray[j].stTime;
                trafficItem.edTime = speedArray[j].edTime;
                trafficItem.avgSpeed =  speedArray[j].speed;
                trafficItem.count = 1;
                trafficItem.trustValue = 0.5;

                
                pushSpeedSeg(segmentList[i].rdName, trafficItem);
            }
        }
    }

}


function combineTraffic()
{
    var rdCnt = gPathTraffic.length;
    
    
    
    for (var i=0; i<rdCnt; i++)
    {
        var rdName = gPathTraffic[i].rdName;
        var pntList = getRoadPointsbyName(rdName);
        var periodCnt = gPathTraffic[i].TraffPeriodList.length;
        
        for (var j=0; j<periodCnt; j++)
        {
            var newTrafficSegCointer = new Array();
            var tmpSegTraffic = new SegTraffic();

            var periodItem = gPathTraffic[i].TraffPeriodList[j];
            var segCnt = periodItem.segTrafficList.length;
            for (var k=0; k<segCnt; k++)
            {
                
                if (k == 0)
                {
                    tmpSegTraffic = periodItem.segTrafficList[k].Clone();
                    //continue;
                }
                else
                {
                    var preLevel = getSpeedLevel(tmpSegTraffic.avgSpeed);
                    var thisLevel = getSpeedLevel(periodItem.segTrafficList[k].avgSpeed);
                    
                    if (preLevel == thisLevel)
                    {
                        
                        if ((tmpSegTraffic.edIndex == periodItem.segTrafficList[k].stIndex) || ((tmpSegTraffic.edIndex+4) > periodItem.segTrafficList[k].stIndex))
                        {
                            var tmpPointCnt = tmpSegTraffic.edIndex - tmpSegTraffic.stIndex + 1;
                            var newSpeed = (tmpSegTraffic.avgSpeed * tmpPointCnt + periodItem.segTrafficList[k].avgSpeed)/(tmpPointCnt+1);
                            tmpSegTraffic.avgSpeed = newSpeed;
                            tmpSegTraffic.edIndex = periodItem.segTrafficList[k].edIndex;
                            tmpSegTraffic.count = (tmpSegTraffic.count * tmpPointCnt + periodItem.segTrafficList[k].count)/(tmpPointCnt+1);
                        }
                        else 
                        {
                            newTrafficSegCointer.push(tmpSegTraffic);
                            tmpSegTraffic = new SegTraffic();
                            tmpSegTraffic = periodItem.segTrafficList[k].Clone();
                        }
                        
                    }
                    else  
                    {
                        newTrafficSegCointer.push(tmpSegTraffic);
                        tmpSegTraffic = new SegTraffic();
                        tmpSegTraffic = periodItem.segTrafficList[k].Clone();
                    }
                    

                }
                if (k == (segCnt-1))
                {
                    newTrafficSegCointer.push(tmpSegTraffic);
                }

                
            }
            var newSegCnt = newTrafficSegCointer.length;
            periodItem.segTrafficList.splice(0);
            
            for (var iNN = 0; iNN < newSegCnt; iNN++)
            {
                periodItem.segTrafficList.push(newTrafficSegCointer[iNN]);
            }

        }
    }
    
}



GetResult = function()
{
    gPotentialPathLinks.splice(0);
    
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
    
    CaculateSpeed();
    staticSpeedInfo();
}





