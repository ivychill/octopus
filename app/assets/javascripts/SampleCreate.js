
function AddStPoint()
{
    var markerSt = new BMap.Marker(point);  // 创建标注
    map.addOverlay(markerSt);              // 将标注添加到地图中
    markerSt.enableDragging();    //可拖拽
    var labelSt = new BMap.Label("起点",{offset:new BMap.Size(0,-20)});
    markerSt.setLabel(labelSt);
    markerSt.addEventListener("dragend",
                              function(e)
                              {
                              sampleSt = e.point;
                              document.getElementById("Output").innerHTML += "</br>" + sampleSt.lng.toFixed(6) +"," +  sampleSt.lat.toFixed(6);
                              
                              }
                              );
    
};


function AddEdPoint()
{
    var markerEd = new BMap.Marker(point);  // 创建标注
    map.addOverlay(markerEd);              // 将标注添加到地图中
    markerEd.enableDragging();    //可拖拽
    var labelEd = new BMap.Label("终点",{offset:new BMap.Size(0,-20)});
    markerEd.setLabel(labelEd);
    markerEd.addEventListener("dragend",
                              function(e)
                              {
                              sampleEd = e.point;
                              document.getElementById("Output").innerHTML += "</br>" + sampleEd.lng.toFixed(6) +"," +  sampleEd.lat.toFixed(6);
                              
                              }
                              );
    
};



function getSamplePoints(startIndex, endIndex, pointList, speed, beginTime, userID, radius)
{
    document.getElementById("Output").innerHTML = "<br/>";
    
    if ((endIndex - startIndex) < 10)
    {
        return;
    }
    var prePoint = pointList[startIndex];
    var preDT = new Date(beginTime);
    var pretime = preDT.getTime();
    
    var tmpBTS = getNearestBTS(prePoint);
    document.getElementById("Output").innerHTML += "<br/>"+ beginTime +"," + userID +","+ tmpBTS.cellid;
    drawBTS(tmpBTS, "0");
    for (var i=startIndex; i<endIndex; i++)
    {
        var tempPoint = pointList[i];
        var retdst = map.getDistance(prePoint, tempPoint);
        
        if (retdst > 2000) //Jet
        {
            //var preTime = new Date()
            var newTmpTime =  pretime + retdst/(speed*1000/3600)*1000;
            pretime = newTmpTime;
            var TmpDT = new Date(newTmpTime);
            var timeStr = TmpDT.getFullYear() + "-"+TmpDT.getMonth()+"-"+TmpDT.getDate()+" "+TmpDT.getHours()+":"+TmpDT.getMinutes()+":"+TmpDT.getSeconds();
            
            tmpBTS = getNearestBTS(tempPoint);
            prePoint = tempPoint;
            document.getElementById("Output").innerHTML += "<br/>"+ timeStr +","+ userID +","+ tmpBTS.cellid;
            drawBTS(tmpBTS, i);
        }
    }
}
