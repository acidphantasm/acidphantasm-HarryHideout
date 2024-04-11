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

        this.fluentAssortCreator.createSingleAssortItem("57347b8b24597737dd42e192") // "classic matches"
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("590c2c9c86f774245b1f03f2") // "mtape"
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5c13cef886f774072e618e82") // toilet paper
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("57347c93245977448d35f6e3") // toothpaste
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5c13cd2486f774072c757944") // soap
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("62a0a098de7ac8199358053b") // awl
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5d1b3f2d86f774253763b735") // disposable syringe
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5d1b3a5d86f774252167ba22") // pile of meds
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("544fb25a4bdc2dfb738b4567") // aseptic bandage
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("62a0a043cf4a99369e2624a5") // multivitamin
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("57347c77245977448d35f6e2") // screw nuts
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("57347c5b245977448d35f6e1") // bolts
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("544fb5454bdc2df8738b456a") // multitool
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("56742c284bdc2d98058b456d") // crickent
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590a3c0a86f774385a33c450") // spark plug
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b2fa286f77425227d1674") // motor
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5733279d245977289b77ec24") // car battery
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5734779624597737e04bf329") // cpu fan
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("61bf7b6302b3924be92fa8c3") // metal spare parts
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b317c86f7742523398392") // handdrill
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("59e35ef086f7741777737012") // "pack screw"
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c5bbd86f774785762df04") // wd40 100ml
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c31c586f774245e3141b2") // nails
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("57347c1124597737fb1379e3") // duct tape
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5e2af2bc86f7746d3f3c33fc") // hunting matches
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("590a373286f774287540368b") // dry fuel
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5af04b6486f774195a3ebb49") // elite plier
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("60391b0fb847c71012789415") // TNT
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b313086f77425227d1678") // phase control relay
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59e36c6f86f774176c10a2a7") // power cord
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("62a09ee4cf4a99369e262453") // white salt
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                            
        this.fluentAssortCreator.createSingleAssortItem("5b4335ba86f7744d2837a264") // bloodset
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59e3606886f77417674759a5") // saline solution
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("619cc01e0a7c3a1a2731940c") // medical tools
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b392c86f77425243e98fe") // light bulb
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5c06779c86f77426e00dd782") // wires
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59e35cbb86f7741778269d83") // hose
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59e35de086f7741778269d84") // drill
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5e2af29386f7746d4159f077") //KEK tape
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("61bf83814088ec1a363d7097") // sewing kit
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c2e1186f77425357b6124") // toolset
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5d1c819a86f774771b0acd6c") // weapon parts
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("62a0a0bb621468534a797ad5") // master files
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        const INTEL = "5c12613b86f7743bbe2c3f76"; // intel folder
        this.fluentAssortCreator.createSingleAssortItem(INTEL)
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("62a0a124de7ac81993580542") // topographic maps
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("574eb85c245977648157eec3") // factory plan map
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("619cbfeb6b8a1b37a54eebfa") // bulbex
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("63a0b208f444d32d6f03ea1e") // sledgehammer
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590a3b0486f7743954552bdb") // pcb
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c311186f77424d1667482") // wrench
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59faf98186f774067b6be103") // alkali
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5d40419286f774318526545f") // metal cutting scissors
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c346786f77423e50ed342") // xenomorph
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("590a3cd386f77436f20848cb") // energy saving lamp
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b304286f774253763a528") // working lcd
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b2ffd86f77425243e8d17") // nixxor
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c392f86f77444754deb29") // ssd
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5734781f24597737e04bf32a") // dvd
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("590a391c86f774385a33c404") // magnet
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5bc9b355d4351e6d1509862a") // fireklean
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("60391a8b3364dc22b04d0ce5") // thermite
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5734795124597738002c6176") // insulating tape
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1c774f86f7746d6620f8db") // helix
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("619cbf476b8a1b37a54eebf8") // military corrugated tube
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("57347c2e24597744902c94a1") // psu
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b327086f7742525194449") // pressure gauge
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        const LEDX_ID = "5c0530ee86f774697952d952"; // LEDX
        this.fluentAssortCreator.createSingleAssortItem(LEDX_ID)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
        const BITCOIN_ID = "59faff1d86f7746c51718c9c"; // Add 2x bitcoin as barter for LEDX
        this.fluentAssortCreator.createSingleAssortItem(LEDX_ID)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addBarterCost(BITCOIN_ID, 2)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5af0534a86f7743b6f354284") // opthalmoscope
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5e2af22086f7746d3f3c33fa") // poxeram
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5b4391a586f7745321235ab2") // wifi camera
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5c06782b86f77426df5407d2") // capacitators
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("590c639286f774151567fa95") // tech manual
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d0378d486f77420421a5ff4") // military pfilter
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("590c595c86f7747884343ad7") // gas mask air filter
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d0375ff86f774186372f685") // military cable
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d03775b86f774203e7e0c4b") // phased array element
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                         
        const CURRENTCONVERTER = "5c0530ee86f774697952d952"; // current converter
        this.fluentAssortCreator.createSingleAssortItem(CURRENTCONVERTER)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
        this.fluentAssortCreator.createSingleAssortItem(CURRENTCONVERTER)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addBarterCost(BITCOIN_ID, 4)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5af0484c86f7740f02001f7f") // majaica
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("59e35abd86f7741778269d82") // sodium bicarbonate
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5e2af00086f7746d3f3c33f7") // drain cleaner
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c35a486f774273531c822") // shush
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("60391afc25aff57af81f7085") // ratchet wrench
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5e2aedd986f7746d404f3aa4") // green battery
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("573478bc24597738002c6175") // horse figurine
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("573474f924597738002c6174") // chainlet
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("590c645c86f77412b01304d9") // diary
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("590c651286f7741e566b6461") // slim diary
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("62a09e73af34e73a266d932a") // bakeezy
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590c621186f774138d11ea29") // flash drive
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("590a386e86f77429692b27ab") // hdd
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                            
        this.fluentAssortCreator.createSingleAssortItem("59e3639286f7741777737013") // lion
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5d235a5986f77443f6329bc6") // gold skull
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5734758f24597738025ee253") // gold chain
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("59faf7ca86f7740dbe19f6c2") // bling bling roler
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5d1b376e86f774252519444e") // moonshine
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5b7c710788a4506dec015957") // junkbox
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5bc9bc53d4351e00367fbcee") // golden rooster
                                    .addUnlimitedStackCount()
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
        this.fluentAssortCreator.createSingleAssortItem(VPX)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(2)
                                    .addBarterCost(BITCOIN_ID, 4)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("57347cd0245977445a2d6ff1") // t shaped plug
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b39a386f774252339976f") // silicone tube
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5d1b32c186f774252167a530") // "thermometer"
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("619cbfccbedcde2f5b3f7bdd") // pipe grip wrench
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                                    
        this.fluentAssortCreator.createSingleAssortItem("5c052f6886f7746b1e3db148") // cofdm
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("62a0a16d0b9d3c46de5b6e97") // military flash drive
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("61bf7c024770ee6f9c6b8b53") // secure magnetic tape (SMT)
                                    .addUnlimitedStackCount()
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
                         
        const GPSAMPLIFIER = "5c0530ee86f774697952d952"; // GPS Amplifier
        this.fluentAssortCreator.createSingleAssortItem(GPSAMPLIFIER)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addMoneyCost(Money.ROUBLES, 2000)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);
        this.fluentAssortCreator.createSingleAssortItem(GPSAMPLIFIER)
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
                                    .addBarterCost(BITCOIN_ID, 4)
                                    .addLoyaltyLevel(1)
                                    .export(tables.traders[baseJson._id]);

        this.fluentAssortCreator.createSingleAssortItem("5d03794386f77420415576f5") // military battery
                                    .addUnlimitedStackCount()
                                    .addBuyRestriction(1)
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