import { DependencyContainer } from "tsyringe";

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
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import * as fs from "node:fs";
import * as path from "node:path";
import * as items from "../config/items.json";

// New trader settings
import * as baseJson from "../db/base.json";
import { TraderHelper } from "./traderHelpers";
import { FluentAssortConstructor as FluentAssortCreator } from "./fluentTraderAssortCreator";
import { Money } from "@spt-aki/models/enums/Money";
import { Traders } from "@spt-aki/models/enums/Traders";
import { HashUtil } from "@spt-aki/utils/HashUtil";

class HideoutHarry implements IPreAkiLoadMod, IPostDBLoadMod
{
    private mod: string
    private logger: ILogger
    private traderHelper: TraderHelper
    private fluentAssortCreator: FluentAssortCreator
    private static itemsPath = path.resolve(__dirname, "../config/items.json");

    constructor() {
        this.mod = "acidphantasm-HarryHideout"; // Set name of mod so we can log it to console later
    }

    /**
     * Some work needs to be done prior to SPT code being loaded, registering the profile image + setting trader update time inside the trader config json
     * @param container Dependency container
     */
    public preAkiLoad(container: DependencyContainer): void
    {
        // Get a logger
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.logger.debug(`[${this.mod}] preAki Loading... `);

        // Get SPT code/data we need later
        const preAkiModLoader: PreAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const imageRouter: ImageRouter = container.resolve<ImageRouter>("ImageRouter");
        const hashUtil: HashUtil = container.resolve<HashUtil>("HashUtil");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const traderConfig: ITraderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const ragfairConfig = configServer.getConfig<IRagfairConfig>(ConfigTypes.RAGFAIR);

        // Create helper class and use it to register our traders image/icon + set its stock refresh time
        this.traderHelper = new TraderHelper();
        this.fluentAssortCreator = new FluentAssortCreator(hashUtil, this.logger);
        this.traderHelper.registerProfileImage(baseJson, this.mod, preAkiModLoader, imageRouter, "cat.jpg");
        this.traderHelper.setTraderUpdateTime(traderConfig, baseJson, 3600, 4000);

        // Add trader to trader enum
        Traders[baseJson._id] = baseJson._id;

        // Add trader to flea market
        ragfairConfig.traders[baseJson._id] = true;

        this.logger.debug(`[${this.mod}] preAki Loaded`);
    }
    
    /**
     * Majority of trader-related work occurs after the aki database has been loaded but prior to SPT code being run
     * @param container Dependency container
     */
    public postDBLoad(container: DependencyContainer): void
    {
        this.logger.debug(`[${this.mod}] postDb Loading... `);

        // Resolve SPT classes we'll use
        const logger = container.resolve<ILogger>("WinstonLogger");
        const databaseServer: DatabaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const configServer: ConfigServer = container.resolve<ConfigServer>("ConfigServer");
        const jsonUtil: JsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const priceTable = databaseServer.getTables().templates.prices;
        const itemTable = databaseServer.getTables().templates.items;
        const handbookTable = databaseServer.getTables().templates.handbook;

        // Get a reference to the database tables
        const tables = databaseServer.getTables();

        // Add new trader to the trader dictionary in DatabaseServer - has no assorts (items) yet
        this.traderHelper.addTraderToDb(baseJson, tables, jsonUtil);

        this.fluentAssortCreator.createSingleAssortItem("569668774bdc2da2298b4568") // "euros"
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5696686a4bdc2da3298b456a") // "dollars"
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
/*
        const classicMatches = "57347b8b24597737dd42e192";
        this.fluentAssortCreator.createSingleAssortItem(classicMatches) // "classic matches"
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, priceTable[classicMatches])
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("590c2c9c86f774245b1f03f2") // "mtape"
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

*/      let test: Record<string, number>;
        /// This section generates basic items with Rouble price only
        if (fs.existsSync(HideoutHarry.itemsPath))
            {
                logger.log("itemJSON exists!", "cyan");
                const itemIDs = JSON.parse(fs.readFileSync(HideoutHarry.itemsPath, "utf-8"));
                logger.log(itemIDs, "cyan");
                for (const itemId in itemIDs)
                    {
                        let price = priceTable[itemId]
                        if (!price)
                            {
                                price = handbookTable.Items.find(x => x.Id === itemId)?.Price ?? 1;
                            }
                        logger.log("ItemID: " +itemId+ " for price: "+ price, "cyan");
                        this.fluentAssortCreator.createSingleAssortItem(itemId)
                        .addUnlimitedStackCount()
                        .addMoneyCost(Money.ROUBLES, price)
                        .addLoyaltyLevel(1)
                        .export(tables.traders[baseJson._id]);
                        logger.log("Price acquired for "+itemId+", added to trader for "+price, "cyan");
                    }
            }
            else 
            {
                logger.log("acidphantasm-HarryHidout is missing items.json. You have installed the mod incorrectly.", "red");
            }
        /// This section generates barter traders only
                                    
        const LEDX_ID = "5c0530ee86f774697952d952"; // LEDX
        const BITCOIN_ID = "59faff1d86f7746c51718c9c"; // Add 2x bitcoin as barter for LEDX
        this.fluentAssortCreator.createSingleAssortItem(LEDX_ID)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addBarterCost(BITCOIN_ID, 3)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                         
        const CURRENTCONVERTER = "6389c85357baa773a825b356"; // current converter
        this.fluentAssortCreator.createSingleAssortItem(CURRENTCONVERTER)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addBarterCost(BITCOIN_ID, 4)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        const VPX = "5c05300686f7746dce784e5d"; // vpx
        this.fluentAssortCreator.createSingleAssortItem(VPX)
                                    .addUnlimitedStackCount()
                                    .addBarterCost(BITCOIN_ID, 1)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                         
        const GPSAMPLIFIER = "6389c7f115805221fb410466"; // GPS Amplifier
        this.fluentAssortCreator.createSingleAssortItem(GPSAMPLIFIER)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addBarterCost(BITCOIN_ID, 4)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
        const militaryBattery = "5d03794386f77420415576f5"; // military battery
        this.fluentAssortCreator.createSingleAssortItem(militaryBattery)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addBarterCost(BITCOIN_ID, 2)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        // Add trader to locale file, ensures trader text shows properly on screen
        // WARNING: adds the same text to ALL locales (e.g. chinese/french/english)
        this.traderHelper.addTraderToLocales(baseJson, tables, baseJson.name, "Hideout Harry", baseJson.nickname, baseJson.location, "I'm sellin', what are you buyin'?");

        this.logger.debug(`[${this.mod}] postDb Loaded`);
    }
}

module.exports = { mod: new HideoutHarry() }