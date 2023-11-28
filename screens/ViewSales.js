import { View, Text, Alert, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { BaseApiService } from "../utils/BaseApiService";
import { Table, Row, Rows, TableWrapper } from "react-native-table-component";
import Colors from "../constants/Colors";
import AppStatusBar from "../components/AppStatusBar";
import OrientationLoadingOverlay from "react-native-orientation-loading-overlay";
import BlackAndWhiteScreen from "../components/BlackAndWhiteScreen";
import { TextInput } from "react-native";
import { Calendar } from "react-native-calendars";
import MaterialButton from "../components/MaterialButton";
import ModalContent from "../components/ModalContent";
import { formatNumberWithCommas } from "../utils/Utils";

const tableHead = ["Item", "Price", "Qty", "Amount"];

export default function ViewSales({ navigation, route }) {
  const [sales, setSales] = useState([]); // sales got from the server
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [visible, setVisible] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [allSales, setAllSales] = useState([]);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [initialCapital, setInitialCapital] = useState(null);

  const calendarTheme = {
    calendarBackground: "black",
    arrowColor: Colors.primary,
    todayTextColor: Colors.primary,
    monthTextColor: Colors.light,
    selectedDayBackgroundColor: Colors.primary,
    textDisabledColor: Colors.gray, //other months dates
    textSectionTitleColor: Colors.light, // days
    dayTextColor: Colors.light,
    selectedDayTextColor: "black",
  };

  const {
    isShopOwner,
    isShopAttendant,
    attendantShopId,
    shopOwnerId,
    myShopId,
  } = route.params;

  const handleDayPress = (day) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(day.dateString);
      setSelectedEndDate(null);
    } else if (
      selectedStartDate &&
      !selectedEndDate &&
      day.dateString !== selectedStartDate
    ) {
      setSelectedEndDate(day.dateString);
    } else {
      setSelectedStartDate(day.dateString);
      setSelectedEndDate(null);
    }
  };

  function compareDates(date1, date2) {
    const formattedDate1 = new Date(date1).toISOString().slice(0, 10);
    const formattedDate2 = new Date(date2).toISOString().slice(0, 10);

    return formattedDate1 === formattedDate2;
  }

  function convertDateFormat(dateString) {
    const date = new Date(dateString);

    // Remove time information
    const formattedDate = date.toISOString().slice(0, 10);

    return formattedDate;
  }

  function getProfit() {
    if (performanceSummary && initialCapital) {
      let profits = performanceSummary.totalSalesValue - initialCapital;

      return profits > 0 ? formatNumberWithCommas(profits) : 0;
    }
    return 0;
  }
  let id = isShopAttendant ? attendantShopId : isShopOwner ? myShopId : id;

  function getCurrentDay() {
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    let day = ("0" + currentDate.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  const fetchSumarry = () => {
    new BaseApiService(`/shops/${id}`)
      .getRequestWithJsonResponse()
      .then((response) => {
        setInitialCapital(response.data.initialCapital);
        setPerformanceSummary(response.data.performanceSummary);
        setTimeout(() => {
          setLoading(false);
        }, 100);
      })
      .catch((error) => {
        Alert.alert("Cannot get summary!", error?.message);
        setLoading(false);
      });
  };

  const getSales = async (startDate, endDate) => {
    let searchParameters = {
      offset: offset,
      limit: 50,
      // startDate: getCurrentDay(),
    };

    setLoading(true);

    if (startDate) {
      searchParameters.startDate = startDate;
    }
    if (endDate) {
      searchParameters.endDate = endDate;
    }

    if (isShopOwner) {
      searchParameters.shopOwnerId = shopOwnerId;
    }
    if (isShopAttendant) {
      searchParameters.shopId = attendantShopId;
    }

    new BaseApiService("/shop-sales")
      .getRequestWithJsonResponse(searchParameters)
      .then((response) => {
        setTotalSales(response.totalItems);
        setAllSales(response.records);
        setSales(response.records);
        setTimeout(() => {
          setLoading(false);
        }, 100);
      })
      .catch((error) => {
        Alert.alert("Cannot get sales!", error?.message);
        setLoading(false);
      });
  };

  const filterSales = () => {
    let startDate = selectedStartDate ? new Date(selectedStartDate) : null;
    let endDate = selectedEndDate ? new Date(selectedEndDate) : null;
    let arr;

    setLoading(true);

    if (startDate > endDate) {
      // if the start date is greater than the end date
      [startDate, endDate] = [endDate, startDate]; // Swap the dates using destructuring assignment
    }

    if (selectedEndDate === null) {
      //filtering a single day
      arr = allSales.filter((item) =>
        compareDates(convertDateFormat(item.dateCreated), selectedStartDate)
      );
    }

    if (startDate && endDate) {
      arr = allSales.filter((item) => {
        const itemDate = new Date(item.dateCreated);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    setSales(arr);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    getSales();
    fetchSumarry();
  }, []);

  return (
    <BlackAndWhiteScreen flex={1.3} bgColor={Colors.light_2}>
      <View style={{ flex: 0.8 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            marginVertical: 10,
          }}
        >
          <View>
            <Text
              style={{ color: Colors.primary, fontSize: 16, fontWeight: 600 }}
            >
              Day's sales
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              style={{
                backgroundColor: Colors.light,
                height: 25,
                borderRadius: 3,
                marginHorizontal: 5,
                width: 100,
              }}
              placeholder="Search text"
            />
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 3,
                height: 25,
                justifyContent: "center",
              }}
              onPress={
                () =>
                  navigation.navigate("shopSummary", {
                    isShopOwner,
                    isShopAttendant,
                    attendantShopId,
                    shopOwnerId,
                    myShopId,
                  })
                // setVisible(true)
              }
            >
              <Text
                style={{
                  color: Colors.dark,
                  paddingHorizontal: 6,
                  alignSelf: "center",
                  justifyContent: "center",
                }}
              >
                Investment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 15,
            justifyContent: "space-between",
            paddingHorizontal: 12,
          }}
        >
          <ItemHeader title="Items" value={totalSales || ""} unit="Qty" />
          <View
            style={{
              width: 1,
              height: "inherit",
              backgroundColor: Colors.primary,
            }}
          />
          <ItemHeader
            title="Sales"
            value={
              performanceSummary &&
              formatNumberWithCommas(performanceSummary?.totalSalesValue)
            }
          />
          <View
            style={{
              width: 1,
              height: "inherit",
              backgroundColor: Colors.primary,
            }}
          />
          <ItemHeader
            title="Capital"
            value={initialCapital && formatNumberWithCommas(initialCapital)}
          />
          <View
            style={{
              width: 1,
              height: "inherit",
              backgroundColor: Colors.primary,
            }}
          />
          <ItemHeader title="Profit" value={getProfit()} />
        </View>
      </View>
      <View
        style={{
          flex: 3,
          // backgroundColor: Colors.light_2,
          paddingBottom: 20,
        }}
      >
        <OrientationLoadingOverlay
          visible={loading}
          color={Colors.primary}
          indicatorSize="large"
          messageFontSize={24}
          message=""
        />
        <AppStatusBar bgColor="black" content="light-content" />

        <View style={{ marginTop: 1 }}>
          <FlatList
            containerStyle={{ padding: 5 }}
            showsHorizontalScrollIndicator={false}
            data={sales}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <TransactionItem data={item} />}
          />
        </View>
      </View>
      <ModalContent visible={visible} style={{ padding: 10 }}>
        <Calendar
          theme={calendarTheme}
          onDayPress={handleDayPress}
          markedDates={{
            [selectedStartDate]: {
              selected: true,
              startingDay: true,
              endingDay: selectedEndDate === selectedStartDate,
            },
            [selectedEndDate]: {
              selected: true,
              endingDay: true,
            },
          }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <MaterialButton
            title="Cancel"
            style={{
              backgroundColor: "transparent",
              borderRadius: 5,
              borderWidth: 1,
              borderColor: Colors.dark,
              marginStart: -2,
              margin: 10,
              height: 40,
            }}
            titleStyle={{
              fontWeight: "bold",
              color: Colors.dark,
            }}
            buttonPress={() => hide()}
          />
          <MaterialButton
            title="Apply"
            style={{
              backgroundColor: Colors.dark,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: Colors.dark,
              marginStart: 2,
              marginEnd: -2,
              margin: 10,
              height: 40,
            }}
            titleStyle={{
              fontWeight: "bold",
              color: Colors.primary,
            }}
            buttonPress={() => {
              setFiltering(true);
              setVisible(false);
              filterSales();
              setSelectedEndDate(null);
              setSelectedStartDate(null);
            }}
            disabled={!selectedStartDate && !selectedEndDate}
          />
        </View>
      </ModalContent>
    </BlackAndWhiteScreen>
  );
}

function TransactionItem({ data }) {
  function formatDate(inputDate) {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(inputDate);

    // Format the date
    const formattedDate = date.toLocaleDateString("en-US", options);

    return formattedDate;
  }

  const { lineItems, totalCost, amountPaid, balanceGivenOut } = data;

  const [expanded, setExpanded] = useState(false);
  const [list, setList] = useState([]); //to be rendered in the table

  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  useEffect(() => {
    if (data.lineItems !== undefined) {
      if (list.length === 0) {
        for (let item of data.lineItems) {
          list.push([
            item.shopProductName,
            item.unitCost,
            item.quantity,
            item.totalCost,
          ]);
        }
      }
    }
  });
  return (
    <View
      style={{
        flex: 1,
        marginTop: 10,
        marginHorizontal: 10,
        borderRadius: 3,
        backgroundColor: "white",
        paddingVertical: 15,
        paddingHorizontal: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "bold",
            color: Colors.dark,
            marginBottom: 2,
          }}
        >
          Txn ID: {data.id}
        </Text>

        <View>
          <Text
            style={{
              alignSelf: "flex-end",
              fontSize: 12,
            }}
          >
            Currency : UGX
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: Colors.gray,
              alignSelf: "flex-end",
            }}
          >
            {formatDate(data.dateCreated)}
          </Text>
        </View>
      </View>
      {!expanded && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              margin: 10,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text>Items</Text>
              <Text>{(lineItems && lineItems.length) || 0}</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text>Amount</Text>
              <Text>{totalCost}</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text>Recieved</Text>
              <Text>{amountPaid}</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text>Balance</Text>
              <Text>{balanceGivenOut}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontWeight: 300,
                fontSize: 12,
              }}
            >
              Served by:{" "}
              <Text
                style={{
                  fontWeight: 400,
                }}
              >
                {data.createdByFullName}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={toggleExpand}
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: Colors.dark,
                borderRadius: 3,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: Colors.primary,
                  fontSize: 13,
                  fontWeight: 300,
                }}
              >
                More
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {expanded && (
        <View style={{ flex: 1 }}>
          <Table style={{ paddingBottom: 10 }}>
            <Row
              data={tableHead}
              style={{ height: 40 }}
              textStyle={{
                fontWeight: "bold",
              }}
              flexArr={[3.5, 1.2, 0.9, 1]}
            />

            <TableWrapper style={{ flexDirection: "row" }}>
              <Rows
                style={{
                  borderTopColor: Colors.dark,
                  borderTopWidth: 0.5,
                }}
                data={list}
                textStyle={{
                  margin: 5,
                  textAlign: "left",
                }}
                flexArr={[3.5, 1.3, 1, 0.8]}
              />
            </TableWrapper>
          </Table>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Total </Text>

            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  marginEnd: 25,
                }}
              >
                {lineItems && lineItems.length}
              </Text>

              <Text
                style={{
                  alignSelf: "flex-end",
                  fontWeight: "bold",
                  marginEnd: 4,
                }}
              >
                {totalCost}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Recieved </Text>
            <Text
              style={{
                alignSelf: "flex-end",
                fontWeight: "bold",
                marginEnd: 4,
              }}
            >
              {amountPaid}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Purchased </Text>
            <Text
              style={{
                alignSelf: "flex-end",
                fontWeight: "bold",
                marginEnd: 4,
              }}
            >
              {totalCost}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Balance</Text>
            <Text
              style={{
                alignSelf: "flex-end",
                fontWeight: "bold",
                marginEnd: 4,
              }}
            >
              {balanceGivenOut}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <Text
              style={{
                fontWeight: 300,
                fontSize: 12,
              }}
            >
              Served by:{" "}
              <Text
                style={{
                  fontWeight: 400,
                }}
              >
                {data.createdByFullName}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={toggleExpand}
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: Colors.dark,
                borderRadius: 3,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: Colors.primary,
                  fontSize: 13,
                  fontWeight: 300,
                }}
              >
                Hide
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function ItemHeader({ title, value, unit = "Ugx" }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text
        style={{ fontSize: 12, color: Colors.primary, alignSelf: "flex-start" }}
      >
        {unit}
      </Text>
      <Text style={{ fontSize: 14, color: Colors.primary }}>{value}</Text>
      <Text
        style={{ fontSize: 12, color: Colors.primary, alignSelf: "flex-start" }}
      >
        {title}
      </Text>
    </View>
  );
}
