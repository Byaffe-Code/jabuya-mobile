import { View, Text, FlatList } from "react-native";
import React, { useContext, useState, useEffect, useRef } from "react";
import TopHeader from "../components/TopHeader";
import AppStatusBar from "../components/AppStatusBar";
import Colors from "../constants/Colors";
import StockPurchaseListComponent from "../components/stocking/StockPurchaseListComponent";
import SearchBar from "../components/SearchBar";
import { UserContext } from "../context/UserContext";
import { BaseApiService } from "../utils/BaseApiService";
import { MAXIMUM_RECORDS_PER_FETCH } from "../constants/Constants";
import { ActivityIndicator } from "react-native";
import { PanResponder } from "react-native";
import Snackbar from "../components/Snackbar";

const StockPurchase = ({ navigation }) => {
  const [stockEntries, setStockEntries] = useState([]);
  const [stockEntryRecords, setStockEntryRecords] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const snackbarRef = useRef(null);
  const { userParams } = useContext(UserContext);

  const { isShopOwner, isShopAttendant, attendantShopId, shopOwnerId } =
    userParams;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy > 50) {
          // Minimum swipe distance
          console.log("Swiped down!");
          setStockEntries([]);
          setOffset(0);
          setSearchTerm(null);
          fetchStockEntries();
        }
      },
    })
  ).current;

  const fetchStockEntries = async () => {
    try {
      const searchParameters = {
        limit: MAXIMUM_RECORDS_PER_FETCH,
        ...(isShopAttendant && { shopId: attendantShopId }),
        ...(isShopOwner && { shopOwnerId }),
      };
      setIsFetchingMore(true);
      const response = await new BaseApiService(
        "/stock-entries"
      ).getRequestWithJsonResponse({
        ...searchParameters,
        offset: offset,
        ...(searchTerm &&
          searchTerm.trim() !== "" && { searchTerm: searchTerm }),
      });

      setStockEntries((prevEntries) => [...prevEntries, ...response.records]);

      setStockEntryRecords(response.totalItems);
      if (response.totalItems === 0) {
        setMessage("No stock entries found");
      }

      if (response.totalItems === 0 && searchTerm !== "") {
        setMessage(`No results found for ${searchTerm}`);
      }
      setIsFetchingMore(false);
    } catch (error) {
      setLoading(false);

      setMessage("Error fetching stock records");
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const handleEndReached = () => {
    if (!isFetchingMore && stockEntries.length < stockEntryRecords) {
      setOffset(offset + MAXIMUM_RECORDS_PER_FETCH);
    }
    if (stockEntries.length === stockEntryRecords) {
      snackbarRef.current.show("No more additional data");
    }
  };

  useEffect(() => {
    fetchStockEntries();
  }, [offset]);

  const renderFooter = () => {
    if (stockEntries.length === stockEntryRecords) {
      return null;
    }

    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator animating size="large" color={Colors.dark} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light_2 }}>
      <AppStatusBar content="light-content" bgColor="black" />

      <TopHeader
        title="Stock entries"
        showSearch={true}
        toggleSearch={toggleSearch}
        onBackPress={() => navigation.goBack()}
      />

      {showSearch && (
        <SearchBar
          style={{
            borderWidth: 1,
            borderColor: Colors.gray,
            marginBottom: 5,
          }}
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
          }}
          onSearch={() => {
            setStockEntries([]);
            setOffset(0);
            fetchStockEntries();
          }}
        />
      )}
      <FlatList
        keyExtractor={(item) => item.id.toString()}
        data={stockEntries}
        renderItem={({ item }) => <StockPurchaseListComponent data={item} />}
        ListEmptyComponent={() => (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {stockEntryRecords === 0 && <Text>{message}</Text>}
          </View>
        )}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0}
      />

      <Snackbar ref={snackbarRef} />
    </View>
  );
};

const Item = ({ data }) => {
  return (
    <View>
      <Text>{data}</Text>
    </View>
  );
};
export default StockPurchase;
