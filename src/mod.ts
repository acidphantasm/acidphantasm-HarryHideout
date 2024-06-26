import { DependencyContainer, container } from "tsyringe";

// SPT types
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { ITraderConfig } from "@spt-aki/models/spt/config/ITraderConfig";
import { IRagfairConfig } from "@spt-aki/models/spt/config/IRagfairConfig";
import type {DynamicRouterModService} from "@spt-aki/services/mod/dynamicRouter/DynamicRouterModService";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import * as fs from "node:fs";
import * as path from "node:path";

// New trader settings
import * as baseJson from "../db/base.json";
import { TraderHelper } from "./traderHelpers";
import { FluentAssortConstructor as FluentAssortCreator } from "./fluentTraderAssortCreator";
import { Money } from "@spt-aki/models/enums/Money";
import { Traders } from "@spt-aki/models/enums/Traders";
import { HashUtil } from "@spt-aki/utils/HashUtil";

let realismDetected:boolean;

class HideoutHarry implements IPreAkiLoadMod, IPostDBLoadMod
{
    private mod: string
    private logger: ILogger
    private traderHelper: TraderHelper
    private fluentAssortCreator: FluentAssortCreator
    private static config: Config;
    private static itemsPath = path.resolve(__dirname, "../config/items.json");
    private static configPath = path.resolve(__dirname, "../config/config.json");

    constructor() {
        this.mod = "acidphantasm-harryhideout"; // Set name of mod so we can log it to console later
    }
    /**
     * Some work needs to be done prior to SPT code being loaded, registering the profile image + setting trader update time inside the trader config json
     * @param container Dependency container
     */
    public preAkiLoad(container: DependencyContainer): void
    {
        // Get a logger
        this.logger = container.resolve<ILogger>("WinstonLogger");

        // Get SPT code/data we need later
        const preAkiModLoader: PreAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const imageRouter: ImageRouter = container.resolve<ImageRouter>("ImageRouter");
        const databaseServer: DatabaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const hashUtil: HashUtil = container.resolve<HashUtil>("HashUtil");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const traderConfig: ITraderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const ragfairConfig = configServer.getConfig<IRagfairConfig>(ConfigTypes.RAGFAIR);
        const dynamicRouterModService = container.resolve<DynamicRouterModService>("DynamicRouterModService");

        //Load config file before accessing it
        HideoutHarry.config = JSON.parse(fs.readFileSync(HideoutHarry.configPath, "utf-8"));

        // Set config values to local variables for validation & use
        let minRefresh = HideoutHarry.config.traderRefreshMin;
        let maxRefresh = HideoutHarry.config.traderRefreshMax;
        const addToFlea = HideoutHarry.config.addTraderToFlea;
        if (minRefresh >= maxRefresh)
        {
            minRefresh = 1800;
            maxRefresh = 3600;
            this.logger.error(`[${this.mod}] [Config Issue]  traderRefreshMin must be less than traderRefreshMax. Refresh timers have been reset to default.`);
        }
        if (maxRefresh <= 2)
        {
            minRefresh = 1800;
            maxRefresh = 3600;
            this.logger.error(`[${this.mod}] [Config Issue]  You set traderRefreshMax too low. Refresh timers have been reset to default.`);
        }

        // Create helper class and use it to register our traders image/icon + set its stock refresh time
        this.traderHelper = new TraderHelper();
        this.fluentAssortCreator = new FluentAssortCreator(hashUtil, this.logger);
        this.traderHelper.registerProfileImage(baseJson, this.mod, preAkiModLoader, imageRouter, "harry.jpg");
        this.traderHelper.setTraderUpdateTime(traderConfig, baseJson, minRefresh, maxRefresh);

        // Add trader to trader enum
        Traders[baseJson._id] = baseJson._id;

        // Add trader to flea market
        if (addToFlea)
        {
            ragfairConfig.traders[baseJson._id] = true;
        }
        else
        {
            ragfairConfig.traders[baseJson._id] = false;
        }

        dynamicRouterModService.registerDynamicRouter(
            "HarryHideoutRefreshStock",
            [
                {
                    url: "/client/items/prices/HarryHideout",
                    action: (url, info, sessionId, output) => 
                    {
                        const trader = databaseServer.getTables().traders["HarryHideout"];
                        const assortItems = trader.assort.items;
                        if (!realismDetected)
                        {
                            if (HideoutHarry.config.randomizeBuyRestriction)
                            {
                                if (HideoutHarry.config.debugLogging) {this.logger.info(`[${this.mod}] Refreshing HarryHideout Stock with Randomized Buy Restrictions.`);}
                                this.randomizeBuyRestriction(assortItems);
                            }
                            if (HideoutHarry.config.randomizeStockAvailable)
                            {
                                if (HideoutHarry.config.debugLogging) {this.logger.info(`[${this.mod}] Refreshing HarryHideout Stock with Randomized Stock Availability.`);}
                                this.randomizeStockAvailable(assortItems);
                            }
                        }
                        return output;
                    }
                }
            ],
            "aki"
        );
    }
    
    /**
     * Majority of trader-related work occurs after the aki database has been loaded but prior to SPT code being run
     * @param container Dependency container
     */
    public postDBLoad(container: DependencyContainer): void
    {

        HideoutHarry.config = JSON.parse(fs.readFileSync(HideoutHarry.configPath, "utf-8"));

        // Resolve SPT classes we'll use
        const preAkiModLoader: PreAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const logger = container.resolve<ILogger>("WinstonLogger");
        const databaseServer: DatabaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const configServer: ConfigServer = container.resolve<ConfigServer>("ConfigServer");
        const jsonUtil: JsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const priceTable = databaseServer.getTables().templates.prices;
        const handbookTable = databaseServer.getTables().templates.handbook;

        // Get a reference to the database tables
        const tables = databaseServer.getTables();

        // Add new trader to the trader dictionary in DatabaseServer - has no assorts (items) yet
        this.traderHelper.addTraderToDb(baseJson, tables, jsonUtil);
        
        const start = performance.now();

        const itemList = JSON.parse(fs.readFileSync(HideoutHarry.itemsPath, "utf-8"));
        const nonBarterItems = itemList.nonBarterItems;
        const barterItems = itemList.barterItems;
        const lowFleaRange = 0.85;

        //Detect Realism (to ignore randomized settings)
        const realismCheck = preAkiModLoader.getImportedModsNames().includes("SPT-Realism");
        if (HideoutHarry.config.randomizeBuyRestriction || HideoutHarry.config.randomizeStockAvailable)
        {
            this.setRealismDetection(realismCheck);
        }
        else
        {
            this.setRealismDetection(realismCheck);
        }

        // Non-Barter Items Iteration
        for (const item in nonBarterItems)
        {
            const itemID = nonBarterItems[item].itemID;
            if (HideoutHarry.config.useFleaPrices)
            {
                let price = (priceTable[itemID] * HideoutHarry.config.itemPriceMultiplier);
                if (!price)
                {
                    price = (handbookTable.Items.find(x => x.Id === itemID)?.Price ?? 1) * HideoutHarry.config.itemPriceMultiplier;
                }
                this.fluentAssortCreator.createSingleAssortItem(itemID)
                    .addUnlimitedStackCount()
                    .addMoneyCost(Money.ROUBLES, Math.round(price * lowFleaRange))
                    .addLoyaltyLevel(1)
                    .export(tables.traders[baseJson._id])
                if (HideoutHarry.config.debugLogging){
                    logger.log("ItemID: " + itemID + " for price: " + Math.round(price), "cyan");
                }
            }
            else  
            {
                const price = nonBarterItems[item].price
                this.fluentAssortCreator.createSingleAssortItem(itemID)
                    .addUnlimitedStackCount()
                    .addMoneyCost(Money.ROUBLES, Math.round(price * lowFleaRange))
                    .addLoyaltyLevel(1)
                    .export(tables.traders[baseJson._id]);
                if (HideoutHarry.config.debugLogging){
                    logger.log("ItemID: " + itemID + " for price: " + Math.round(price), "cyan");
                }
            }
        }


        // Barter Items Iteration
        for (const item in barterItems){
            {
                const itemID = barterItems[item].itemID;
                const barterItem = barterItems[item].barterItemID;
                const barterAmount = barterItems[item].barterAmount;
                if (HideoutHarry.config.useBarters)
                {
                    this.fluentAssortCreator.createSingleAssortItem(itemID)
                        .addUnlimitedStackCount()
                        .addBarterCost(barterItem, barterAmount)
                        .addLoyaltyLevel(1)
                        .export(tables.traders[baseJson._id])
                    if (HideoutHarry.config.debugLogging){
                        logger.log("ItemID: " + itemID + " for barter: " + barterAmount + " "+ barterItem, "cyan");
                    }
                }
                else  
                {
                    const price = barterItems[item].price
                    this.fluentAssortCreator.createSingleAssortItem(itemID)
                        .addUnlimitedStackCount()
                        .addMoneyCost(Money.ROUBLES, Math.round(price))
                        .addLoyaltyLevel(1)
                        .export(tables.traders[baseJson._id]);
                    if (HideoutHarry.config.debugLogging){
                        logger.log("ItemID: " + itemID + " for price: " + Math.round(price), "cyan");
                    }
                }
            }
        }
        // Add trader to locale file, ensures trader text shows properly on screen
        // WARNING: adds the same text to ALL locales (e.g. chinese/french/english)
        this.traderHelper.addTraderToLocales(baseJson, tables, baseJson.name, "Hideout Harry", baseJson.nickname, baseJson.location, "I'm sellin', what are you buyin'?");

        this.logger.debug(`[${this.mod}] loaded... `);

        const timeTaken = performance.now() - start;
        if (HideoutHarry.config.debugLogging) {logger.log(`[${this.mod}] Assort generation took ${timeTaken.toFixed(3)}ms.`, "green");}
    }
    private setRealismDetection(i: boolean)
    {
        realismDetected = i;
        if (realismDetected)
        {
            this.logger.log(`[${this.mod}] SPT-Realism detected, disabling randomizeBuyRestriction and/or randomizeStockAvailable:`, "yellow");
        }
    }    
    private randomizeBuyRestriction(assortItemTable)
    {
        const randomUtil: RandomUtil = container.resolve<RandomUtil>("RandomUtil");
        // Randomize Assort Availability via config bool for server start
        for (const item in assortItemTable)
        {
            assortItemTable[item].upd.BuyRestrictionMax = 10
            const itemID = assortItemTable[item]._id;
            const oldRestriction = assortItemTable[item].upd.BuyRestrictionMax;
            const newRestriction = Math.round(randomUtil.randInt(1, (oldRestriction)));
            
            assortItemTable[item].upd.BuyRestrictionMax = newRestriction;

            if (HideoutHarry.config.debugLogging) {this.logger.log(`[${this.mod}] Item: [${itemID}] Buy Restriction Changed to: [${newRestriction}]`, "cyan");}
        }
    }
    private randomizeStockAvailable(assortItemTable)
    {
        const randomUtil: RandomUtil = container.resolve<RandomUtil>("RandomUtil");
        for (const item in assortItemTable)
        {
            if (assortItemTable[item].upd?.UnlimitedCount !== undefined)
            {
                assortItemTable[item].upd.UnlimitedCount = false;
                assortItemTable[item].upd.StackObjectsCount = 25;
            }
            const outOfStockRoll = randomUtil.getChance100(HideoutHarry.config.outOfStockChance);
            
            if (outOfStockRoll)
            {
                const itemID = assortItemTable[item]._id;
                assortItemTable[item].upd.StackObjectsCount = 0;

                if (HideoutHarry.config.debugLogging) {this.logger.log(`[${this.mod}] Item: [${itemID}] Marked out of stock`, "cyan");}
            } 
            else
            {
                const itemID = assortItemTable[item]._id;
                const originalStock = assortItemTable[item].upd.StackObjectsCount;
                const newStock = randomUtil.randInt(1, (originalStock));
                assortItemTable[item].upd.StackObjectsCount = newStock;

                if (HideoutHarry.config.debugLogging) {this.logger.log(`[${this.mod}] Item: [${itemID}] Stock Count changed to: [${newStock}]`, "cyan");}
            }
        }
    }
}

interface Config 
{
    useBarters: boolean,
    useFleaPrices: boolean,
    itemPriceMultiplier: number,
    randomizeStockAvailable: boolean,
    outOfStockChance: number,
    randomizeBuyRestriction: boolean,
    traderRefreshMin: number,
    traderRefreshMax: number,
    addTraderToFlea: boolean,
    debugLogging: boolean,
}

module.exports = { mod: new HideoutHarry() }