const TIME_BONUS = 5000;
const AUGMENTATION_PV = 10;
const INTERVAL_SPECIAL = 1500;
const INTERVAL_NORMAL = 250;
const BONUS_NAMES = ['SIZE','SPECIAL_SHOOT','NORMAL_SHOOT'];


function BonusUtils () {}

/**
 * Augmente la vie du player en argument
 * @param player
 */
BonusUtils.prototype.increaseLife = function (player) {
    if(player != null){
        if (player.pv === player.MAX_PV) {
            player.MAX_PV += AUGMENTATION_PV;
            player.pv = player.MAX_PV;
        }else{
            player.pv = (player.pv+AUGMENTATION_PV > player.MAX_PV) ? player.MAX_PV : player.pv += AUGMENTATION_PV;
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
        player.timeLastBonus = new Date().getTime();
        player.currentBonus = BONUS_NAMES[0]; //SIZE
        setTimeout(function () {
            player.resize(factorIncrease);
            player.currentBonus = "";
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
        player.timeLastBonus = new Date().getTime();
        player.currentBonus = BONUS_NAMES[1];
        setTimeout(function () {
            player.intervalSpecialShoot = INTERVAL_SPECIAL_SHOOT;
            player.currentBonus = "";
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
        player.timeLastBonus = new Date().getTime();
        player.currentBonus = BONUS_NAMES[2];
        setTimeout(function () {
            player.intervalNormalShoot = INTERVAL_NORMAL_SHOOT;
            player.currentBonus = "";
        }, TIME_BONUS);
    }
};


