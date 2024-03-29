import AsyncStorage from "@react-native-async-storage/async-storage";
import StorageParams from "../constants/StorageParams";
export class UserSessionUtils {
  /**
   * This is used to get the user's bearer token.
   *
   * @returns
   */
  static async getBearerToken() {
    return await AsyncStorage.getItem(StorageParams.ACCESS_TOKEN);
  }

  /**
   * This is used to get the user's refresh token.
   *
   * @returns
   */
  static async getRefreshToken() {
    return await AsyncStorage.getItem(StorageParams.REFRESH_TOKEN);
  }
  /**
   * This method is used to clear the localstorage and redirect the user to the login screen
   */
  static async clearLocalStorageAndLogout(pageContext) {
    // remove all
    await AsyncStorage.clear();
    pageContext?.pageDispatch({ page: "appTour" });
  }

  /**
   * This method is use to set the user's bearer token.
   *
   * @param bearerToken
   */
  static async setUserAuthToken(bearerToken) {
    await AsyncStorage.setItem(StorageParams.ACCESS_TOKEN, bearerToken);
  }

  /**
   * This method is use to set the user's bearer token.
   *
   * @param bearerToken
   */
  static async setFullSessionObject(fullObject) {
    await AsyncStorage.setItem(
      StorageParams.FULL_LOGIN_DETAILS_JSON,
      JSON.stringify(fullObject)
    );
  }

  /**
   * This method is use to set the user's bearer token.
   *
   * @param bearerToken
   */
  static async getFullSessionObject() {
    const value = await AsyncStorage.getItem(
      StorageParams.FULL_LOGIN_DETAILS_JSON
    );
    return JSON.parse(value);
  }
  /**
   * This method is used to set the user's refresh token.
   *
   * @param refreshToken
   */
  static async setUserRefreshToken(refreshToken) {
    await AsyncStorage.setItem(StorageParams.REFRESH_TOKEN, refreshToken);
  }

  /**
   * This method is used to save a JSON object containing user details to local storage.
   *
   * @param userDetails
   */
  static async setUserDetails(userDetails) {
    await AsyncStorage.setItem(
      StorageParams.USER_DETAILS_JSON,
      JSON.stringify(userDetails)
    );
  }

  /**
   * This method is used to get a JSON object containing user details
   * @returns
   */
  static async getUserDetails() {
    const value = await AsyncStorage.getItem(StorageParams.USER_DETAILS_JSON);
    return JSON.parse(value);
  }

  /**
   * This method is used to get user logged in status
   * @returns
   */
  static async isLoggedIn() {
    try {
      const loggedIn = await AsyncStorage.getItem(StorageParams.IS_LOGGED_IN);
      if (loggedIn == "true") {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * This method is used to set user logged in status
   * @returns
   */
  static async setLoggedIn(loggedIn) {
    if (loggedIn) {
      await AsyncStorage.setItem(StorageParams.IS_LOGGED_IN, "true");
    } else {
      await AsyncStorage.setItem(StorageParams.IS_LOGGED_IN, "false");
    }
  }

  /**
   * This method is used to get the attendant shopId
   * @returns shopId
   */
  static async getShopId() {
    let id = await AsyncStorage.getItem(StorageParams.SHOP_ID);
    return Number(id);
  }

  /**
   * This method is used to set the attendant shopId
   * @param {id} id
   */
  static async setShopid(id) {
    await AsyncStorage.setItem(StorageParams.SHOP_ID, id);
  }
}
