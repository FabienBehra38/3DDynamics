const TIME_BONUS = 5000;
const AUGMENTATION_PV = 10;
const INTERVAL_SPECIAL = 1500;
const INTERVAL_NORMAL = 250;


function BonusUtils () {}

/**
 * Augmente la vie du player en argument
 * @param player
 */
BonusUtils.prototype.increaseLife = function (player) {
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
 * Diminue la taille du player en argument
 * @param {Model} player
 */
BonusUtils.prototype.decreaseSize = function (player) {
    const factorDicrease = 0.65;
    const factorIncrease = 1/factorDicrease;
    if( player != null ){
        player.resize(factorDicrease);
        setTimeout(function () {
            player.resize(factorIncrease);
        }, TIME_BONUS);
    }
};

/**
 * Reduis le chargement entre chaque tir spécial
 * @param player
 */
BonusUtils.prototype.reduceLoadingSpecialShoot = function (player) {

    if( player != null ){
        player.intervalSpecialShoot = INTERVAL_SPECIAL;
        setTimeout(function () {
            player.intervalSpecialShoot = INTERVAL_SPECIAL_SHOOT;
        }, TIME_BONUS);
    }
};

/**
 * Réduis le chargement entre chaque tir normal
 * @param player
 */
BonusUtils.prototype.reduceLoadingNormalShoot = function (player) {

    if( player != null ){
        player.intervalNormalShoot = INTERVAL_NORMAL;
        setTimeout(function () {
            player.intervalNormalShoot = INTERVAL_NORMAL_SHOOT;
        }, TIME_BONUS);
    }
};


