import 'package:flutter/material.dart';
import 'package:patient_app/features/auth/service/auth_service.dart';
import 'package:patient_app/helpers/token_expiry_helper.dart';
import 'package:patient_app/models/user_model.dart';
import 'package:patient_app/socket.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider with ChangeNotifier {
  
  UserModel? _user;
  String? _token;
  bool _loading = false;

  UserModel? get user => _user;
  bool get loading => _loading;
  bool get isLoggedIn => _token != null;
  String? get token => _token;
  String? get patientId => _user?.patientId;


  void _setLoading(bool value) {
    _loading = value;
    notifyListeners();
  }

  // 🔐 LOGIN
  Future<void> login({
    required String email,
    required String password,
  }) async {
    try {
      _setLoading(true);

      final res = await AuthApiService.login(
        email: email,
        password: password,
      );

      if (res['success'] == true) {
        _token = res['token'];
        _user = UserModel.fromJson(res);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);

        // // 🔥 SOCKET CONNECT
        // if (_user?.patientId != null) {
        //   SocketService().connectPatient(_user!.patientId!);
        // }

        print("Saved token: $_token");
        print("User: ${_user!.name}");
        notifyListeners();
      } else {
        throw res['msg'];
      }
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  // 📝 REGISTER ( TOKEN SAVE)
  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String gender,
    required DateTime dob,
    required String bloodGroup,
    required String phone,
  }) async {
    try {
      _setLoading(true);

      final res = await AuthApiService.register(
        name: name,
        email: email,
        password: password, 
        gender: gender, 
        dob: dob, 
        phone: phone,
        bloodGroup: bloodGroup,
      );

      // if (res['success'] != true) {
      //   throw res['msg'];
      // }

      if (res['success'] == true) {
        _token = res['token'];
        _user = UserModel.fromJson(res);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        // // 🔥 SOCKET CONNECT
        // if (_user?.patientId != null) {
        //   SocketService().connectPatient(_user!.patientId!);
        // }

        //notifyListeners();
      } else {
        throw res['msg'];
      }

    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  // 🔄 AUTO LOGIN
  // Future<bool> tryAutoLogin() async {
  //   final prefs = await SharedPreferences.getInstance();
  //   if (!prefs.containsKey('token')) return false;

  //   _token = prefs.getString('token');
  //   notifyListeners();
  //   return true;
  // }

  // 🚪 LOGOUT
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    SocketService().disconnect();
    _user = null;
    _token = null;

    notifyListeners();
  }
  
  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();

    if (!prefs.containsKey('token')) return false;

    final savedToken = prefs.getString('token')!;
    if (isTokenExpired(savedToken)) {
      await logout();
      return false;
    }

    _token = savedToken;

    // optional but recommended
    try {
      final res = await AuthApiService.getProfile(_token!);
      _user = UserModel.fromJson(res);

      // if (_user?.patientId != null) {
      //   SocketService().connectPatient(_user!.patientId!);
      // }

      notifyListeners();
      return true;
    } catch (e) {
      // 🔥 token invalid / api fail
      await logout();
      return false;
    }
  }
}
