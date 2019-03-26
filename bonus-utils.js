function BonusUtils () {

}

BonusUtils.prototype.increaseLife = function (player) {
    console.log("nique ta grosse daronne");
    const AUGMENTATION_PV = 10;
    if(player != null){
        if (player.pv === player.MAX_PV) {
            player.MAX_PV += AUGMENTATION_PV;
            player.pv = player.MAX_PV;

            if(player == ennemy){
                $("#lifePikachu").attr('max',player.MAX_PV).attr('value',player.MAX_PV).attr('data-content',player.pv);
            }else{
                $("#lifePlane").attr('max',player.MAX_PV).attr('value',player.MAX_PV).attr('data-content',player.pv);
            }
        }else{
            player.pv = (player.pv+=AUGMENTATION_PV > player.MAX_PV) ? player.MAX_PV : player.pv += AUGMENTATION_PV;
        }
    }
}