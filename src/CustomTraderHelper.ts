import { InventoryHelper } from "@spt/helpers/InventoryHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { TradeHelper } from "@spt/helpers/TradeHelper";
import { TraderAssortHelper } from "@spt/helpers/TraderAssortHelper";
import { TraderHelper } from "@spt/helpers/TraderHelper";
import { IPmcData } from "@spt/models/eft/common/IPmcData";
import { IItem } from "@spt/models/eft/common/tables/IItem";
import { IAddItemsDirectRequest } from "@spt/models/eft/inventory/IAddItemsDirectRequest";
import { IItemEventRouterResponse } from "@spt/models/eft/itemEvent/IItemEventRouterResponse";
import { IProcessBuyTradeRequestData } from "@spt/models/eft/trade/IProcessBuyTradeRequestData";
import { BackendErrorCodes } from "@spt/models/enums/BackendErrorCodes";
import { Traders } from "@spt/models/enums/Traders";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { EventOutputHolder } from "@spt/routers/EventOutputHolder";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { RagfairServer } from "@spt/servers/RagfairServer";
import { DatabaseService } from "@spt/services/DatabaseService";
import { FenceService } from "@spt/services/FenceService";
import { LocalisationService } from "@spt/services/LocalisationService";
import { PaymentService } from "@spt/services/PaymentService";
import { TraderPurchasePersisterService } from "@spt/services/TraderPurchasePersisterService";
import { HttpResponseUtil } from "@spt/utils/HttpResponseUtil";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { inject, injectable } from "tsyringe";

@injectable()
export class CustomTradeHelper extends TradeHelper
{
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("EventOutputHolder") protected eventOutputHolder: EventOutputHolder,
        @inject("TraderHelper") protected traderHelper: TraderHelper,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("PaymentService") protected paymentService: PaymentService,
        @inject("FenceService") protected fenceService: FenceService,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
        @inject("InventoryHelper") protected inventoryHelper: InventoryHelper,
        @inject("RagfairServer") protected ragfairServer: RagfairServer,
        @inject("TraderAssortHelper") protected traderAssortHelper: TraderAssortHelper,
        @inject("TraderPurchasePersisterService")
        protected traderPurchasePersisterService: TraderPurchasePersisterService,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("PrimaryCloner") protected cloner: ICloner
    ) 
    {
        super(logger, 
            databaseService, 
            eventOutputHolder, 
            traderHelper, 
            itemHelper, 
            paymentService, 
            fenceService, 
            localisationService, 
            httpResponse, 
            inventoryHelper, 
            ragfairServer, 
            traderAssortHelper, 
            traderPurchasePersisterService, 
            configServer, 
            cloner)
    }
    
    public override buyItem(
        pmcData: IPmcData,
        buyRequestData: IProcessBuyTradeRequestData,
        sessionID: string,
        foundInRaid: boolean,
        output: IItemEventRouterResponse
    ): void 
    {
        let offerItems: IItem[] = [];
        let buyCallback: (buyCount: number) => void;
        if (buyRequestData.tid.toLocaleLowerCase() === "ragfair") 
        {
            buyCallback = (buyCount: number) => 
            {
                const allOffers = this.ragfairServer.getOffers();

                // We store ragfair offerid in buyRequestData.item_id
                const offerWithItem = allOffers.find((x) => x._id === buyRequestData.item_id);
                const itemPurchased = offerWithItem.items[0];

                // Ensure purchase does not exceed trader item limit
                const assortHasBuyRestrictions = this.itemHelper.hasBuyRestrictions(itemPurchased);
                if (assortHasBuyRestrictions) 
                {
                    this.checkPurchaseIsWithinTraderItemLimit(
                        sessionID,
                        pmcData,
                        buyRequestData.tid,
                        itemPurchased,
                        buyRequestData.item_id,
                        buyCount
                    );

                    // Decrement trader item count
                    const itemPurchaseDetails = {
                        items: [{ itemId: buyRequestData.item_id, count: buyCount }],
                        traderId: buyRequestData.tid
                    };
                    this.traderHelper.addTraderPurchasesToPlayerProfile(sessionID, itemPurchaseDetails, itemPurchased);
                }
            };

            // Get raw offer from ragfair, clone to prevent altering offer itself
            const allOffers = this.ragfairServer.getOffers();
            const offerWithItemCloned = this.cloner.clone(allOffers.find((x) => x._id === buyRequestData.item_id));
            offerItems = offerWithItemCloned.items;
        }
        else if (buyRequestData.tid === Traders.FENCE) 
        {
            buyCallback = (buyCount: number) => 
            {
                // Update assort/flea item values
                const traderAssorts = this.traderHelper.getTraderAssortsByTraderId(buyRequestData.tid).items;
                const itemPurchased = traderAssorts.find((assort) => assort._id === buyRequestData.item_id);

                // Decrement trader item count
                itemPurchased.upd.StackObjectsCount -= buyCount;

                this.fenceService.amendOrRemoveFenceOffer(buyRequestData.item_id, buyCount);
            };

            const fenceItems = this.fenceService.getRawFenceAssorts().items;
            const rootItemIndex = fenceItems.findIndex((item) => item._id === buyRequestData.item_id);
            if (rootItemIndex === -1) 
            {
                this.logger.debug(`Tried to buy item ${buyRequestData.item_id} from fence that no longer exists`);
                const message = this.localisationService.getText("ragfair-offer_no_longer_exists");
                this.httpResponse.appendErrorToOutput(output, message);

                return;
            }

            offerItems = this.itemHelper.findAndReturnChildrenAsItems(fenceItems, buyRequestData.item_id);
        }
        else 
        {
            if (buyRequestData.tid === "67419e9d0d4541ce671543bb") foundInRaid = true;
            // Non-fence trader
            buyCallback = (buyCount: number) => 
            {
                // Update assort/flea item values
                const traderAssorts = this.traderHelper.getTraderAssortsByTraderId(buyRequestData.tid).items;
                const itemPurchased = traderAssorts.find((item) => item._id === buyRequestData.item_id);

                // Ensure purchase does not exceed trader item limit
                const assortHasBuyRestrictions = this.itemHelper.hasBuyRestrictions(itemPurchased);
                if (assortHasBuyRestrictions) 
                {
                    // Will throw error if check fails
                    this.checkPurchaseIsWithinTraderItemLimit(
                        sessionID,
                        pmcData,
                        buyRequestData.tid,
                        itemPurchased,
                        buyRequestData.item_id,
                        buyCount
                    );
                }

                // Check if trader has enough stock
                if (itemPurchased.upd.StackObjectsCount < buyCount) 
                {
                    throw new Error(
                        `Unable to purchase ${buyCount} items, this would exceed the remaining stock left ${itemPurchased.upd.StackObjectsCount} from the traders assort: ${buyRequestData.tid} this refresh`
                    );
                }

                // Decrement trader item count
                itemPurchased.upd.StackObjectsCount -= buyCount;

                if (assortHasBuyRestrictions) 
                {
                    const itemPurchaseDat = {
                        items: [{ itemId: buyRequestData.item_id, count: buyCount }],
                        traderId: buyRequestData.tid
                    };
                    this.traderHelper.addTraderPurchasesToPlayerProfile(sessionID, itemPurchaseDat, itemPurchased);
                }
            };

            // Get all trader assort items
            const traderItems = this.traderAssortHelper.getAssort(sessionID, buyRequestData.tid).items;

            // Get item + children for purchase
            const relevantItems = this.itemHelper.findAndReturnChildrenAsItems(traderItems, buyRequestData.item_id);
            if (relevantItems.length === 0) 
            {
                this.logger.error(
                    `Purchased trader: ${buyRequestData.tid} offer: ${buyRequestData.item_id} has no items`
                );
            }
            offerItems.push(...relevantItems);
        }

        // Get item details from db
        const itemDbDetails = this.itemHelper.getItem(offerItems[0]._tpl)[1];
        const itemMaxStackSize = itemDbDetails._props.StackMaxSize;
        const itemsToSendTotalCount = buyRequestData.count;
        let itemsToSendRemaining = itemsToSendTotalCount;

        // Construct array of items to send to player
        const itemsToSendToPlayer: IItem[][] = [];
        while (itemsToSendRemaining > 0) 
        {
            const offerClone = this.cloner.clone(offerItems);
            // Handle stackable items that have a max stack size limit
            const itemCountToSend = Math.min(itemMaxStackSize, itemsToSendRemaining);
            offerClone[0].upd.StackObjectsCount = itemCountToSend;

            // Prevent any collisions
            this.itemHelper.remapRootItemId(offerClone);
            if (offerClone.length > 1) 
            {
                this.itemHelper.reparentItemAndChildren(offerClone[0], offerClone);
            }

            itemsToSendToPlayer.push(offerClone);

            // Remove amount of items added to player stash
            itemsToSendRemaining -= itemCountToSend;
        }

        // Construct request
        const request: IAddItemsDirectRequest = {
            itemsWithModsToAdd: itemsToSendToPlayer,
            foundInRaid: foundInRaid,
            callback: buyCallback,
            useSortingTable: false
        };

        // Add items + their children to stash
        this.inventoryHelper.addItemsToStash(sessionID, request, pmcData, output);
        if (output.warnings.length > 0) 
        {
            return;
        }

        /// Pay for purchase
        this.paymentService.payMoney(pmcData, buyRequestData, sessionID, output);
        if (output.warnings.length > 0) 
        {
            const errorMessage = `Transaction failed: ${output.warnings[0].errmsg}`;
            this.httpResponse.appendErrorToOutput(output, errorMessage, BackendErrorCodes.UNKNOWN_TRADING_ERROR);
        }
    }
}