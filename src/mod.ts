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

// New trader settings
import * as baseJson from "../db/base.json";
import { TraderHelper } from "./traderHelpers";
import { FluentAssortConstructor as FluentAssortCreator } from "./fluentTraderAssortCreator";
import { Money } from "@spt-aki/models/enums/Money";
import { Traders } from "@spt-aki/models/enums/Traders";
import { HashUtil } from "@spt-aki/utils/HashUtil";

class SampleTrader implements IPreAkiLoadMod, IPostDBLoadMod
{
    private mod: string
    private logger: ILogger
    private traderHelper: TraderHelper
    private fluentAssortCreator: FluentAssortCreator

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
        const databaseServer: DatabaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const configServer: ConfigServer = container.resolve<ConfigServer>("ConfigServer");
        const jsonUtil: JsonUtil = container.resolve<JsonUtil>("JsonUtil");

        // Get a reference to the database tables
        const tables = databaseServer.getTables();

        // Add new trader to the trader dictionary in DatabaseServer - has no assorts (items) yet
        this.traderHelper.addTraderToDb(baseJson, tables, jsonUtil);

        /// HARDWARE
        this.fluentAssortCreator.createSingleAssortItem("57347c77245977448d35f6e2") // "nuts"
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(12)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("59e35ef086f7741777737012") // "pack screw"
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(20)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b32c186f774252167a530") // "thermometer"
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(2)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c31c586f774245e3141b2") // nails
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(4)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("57347c5b245977448d35f6e1") //bolts
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(18)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59e35cbb86f7741778269d83") // hose
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(26)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("57347c1124597737fb1379e3") // duct tape
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(6)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59e35de086f7741778269d84") // drill
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(6)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b2fa286f77425227d1674") // motor
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(12)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59faf98186f774067b6be103") // alkali
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(2)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("544fb5454bdc2df8738b456a") // multitool
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b392c86f77425243e98fe") // light bulb
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(14)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b327086f7742525194449") // pressure gauge
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(8)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1c774f86f7746d6620f8db") // helix
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(8)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c2e1186f77425357b6124") // toolset
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(6)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b39a386f774252339976f") // silicone tube
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(14)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c311186f77424d1667482") // wrench
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(4)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5af04b6486f774195a3ebb49") // elite plier
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(4)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5bc9b355d4351e6d1509862a") // fireklean
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590a3c0a86f774385a33c450") // spark plug
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(5)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c346786f77423e50ed342") // xenomorph
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(3)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b317c86f7742523398392") // handdrill
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c5bbd86f774785762df04") // wd40 100ml
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(4)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c35a486f774273531c822") // shush
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(5)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
        /// ELECTRONICS
        this.fluentAssortCreator.createSingleAssortItem("5734779624597737e04bf329") // cpu fan
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(50)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5c06782b86f77426df5407d2") // capacitators
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(12)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5733279d245977289b77ec24") // car battery
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(5)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590a386e86f77429692b27ab") // hdd
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(4)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b313086f77425227d1678") // phase control relay
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(16)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("57347c2e24597744902c94a1") // psu
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(15)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59e36c6f86f774176c10a2a7") // power cord
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(13)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590a3b0486f7743954552bdb") // pcb
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(10)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c392f86f77444754deb29") // ssd
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c621186f774138d11ea29") // flash drive
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(3)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5c06779c86f77426e00dd782") // wires
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(53)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b304286f774253763a528") // working lcd
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(2)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b2ffd86f77425243e8d17") // nixxor
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(8)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5c052f6886f7746b1e3db148") // cofdm
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(2)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        const VPX = "5c05300686f7746dce784e5d"; // vpx
        this.fluentAssortCreator.createSingleAssortItem(VPX)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(2)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590a3efd86f77437d351a25b") // gas an
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(3)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d0375ff86f774186372f685") // military cable
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(8)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d03775b86f774203e7e0c4b") // phased array element
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(2)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d0378d486f77420421a5ff4") // military pfilter
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(4)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
        // MEDICAL                            
        this.fluentAssortCreator.createSingleAssortItem("5b4335ba86f7744d2837a264") // bloodset
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(2)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59e3606886f77417674759a5") // saline solution
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(7)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59e35abd86f7741778269d82") // sodium bicarbonate
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(3)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5af0484c86f7740f02001f7f") // majaica
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(3)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        const LEDX_ID = "5c0530ee86f774697952d952"; // LEDX
        this.fluentAssortCreator.createSingleAssortItem(LEDX_ID)
                                    .addStackCount(12)
                                    .addBuyRestriction(12)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
        const BITCOIN_ID = "59faff1d86f7746c51718c9c"; // Add 2x bitcoin as barter for LEDX
        this.fluentAssortCreator.createSingleAssortItem(LEDX_ID)
                                    .addStackCount(1)
                                    .addBarterCost(BITCOIN_ID, 2)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5af0534a86f7743b6f354284") // opthalmoscope
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
        // VALUABLES                            
        this.fluentAssortCreator.createSingleAssortItem("59e3639286f7741777737013") // lion
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(4)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        const INTEL = "5c12613b86f7743bbe2c3f76"; // intel folder
        this.fluentAssortCreator.createSingleAssortItem(INTEL)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(4)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5d235a5986f77443f6329bc6") // gold skull
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(6)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5734758f24597738025ee253") // gold chain
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(8)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("59faf7ca86f7740dbe19f6c2") // bling bling roler
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(4)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        // Add trader to locale file, ensures trader text shows properly on screen
        // WARNING: adds the same text to ALL locales (e.g. chinese/french/english)
        this.traderHelper.addTraderToLocales(baseJson, tables, baseJson.name, "Cat", baseJson.nickname, baseJson.location, "This is the cat shop");

        this.logger.debug(`[${this.mod}] postDb Loaded`);
    }
}

module.exports = { mod: new SampleTrader() }