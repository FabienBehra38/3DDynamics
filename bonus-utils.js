function BonusUtils () {

}

BonusUtils.prototype.increaseLife = function (player) {
    const AUGMENTATION_PV = 10;
    if(player != null){
        console.log("pv : "+player.pv+ " && MAX : "+player.MAX_PV);
        if (player.pv === player.MAX_PV) {
            player.MAX_PV += AUGMENTATION_PV;
            player.pv = player.MAX_PV;
        }else{
            player.pv = (player.pv+AUGMENTATION_PV > player.MAX_PV) ? player.MAX_PV : player.pv += AUGMENTATION_PV;
        }

        if(player == ennemy){
            $("#lifePikachu").attr('max',player.MAX_PV).attr('value',player.pv).attr('data-content',player.pv);
        }else{
            $("#lifePlane").attr('max',player.MAX_PV).attr('value',player.pv).attr('data-content',player.pv);
        }
    }
};

/**
 *
 * @param {Model} player
 */
BonusUtils.prototype.decreaseSize = function (player) {
    const TIME_BONUS = 5000; // 5sec
    const factorDicrease = 0.65;
    const factorIncrease = 1/factorDicrease;
    if( player != null ){
        player.resize(factorDicrease);
        setTimeout(function () {
            player.resize(factorIncrease);
        }, TIME_BONUS);
    }
};
