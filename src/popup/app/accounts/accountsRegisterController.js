﻿angular
    .module('bit.accounts')

    .controller('accountsRegisterController', function ($scope, $state, cryptoService, toastr, $q, apiService) {
        popupUtils.initListSectionItemListeners();
        $('#email').focus();

        $scope.submitPromise = null;
        $scope.submit = function (model) {
            if (!model.email) {
                toastr.error('Email is required.');
                return;
            }
            if (!model.masterPassword) {
                toastr.error('Master password is required.');
                return;
            }
            if (model.masterPassword !== model.masterPasswordRetype) {
                toastr.error('Master password confirmation does not match.');
                return;
            }

            var email = model.email.toLowerCase();
            var key = cryptoService.makeKey(model.masterPassword, email);
            $scope.submitPromise = registerPromise(key, model.masterPassword, email, model.hint);
            $scope.submitPromise.then(function () {
                toastr.success('Your new account has been created! You may now log in.');
                $state.go('login', { email: email, animation: 'in-slide-left' });
            });
        };

        function registerPromise(key, masterPassword, email, hint) {
            return $q(function (resolve, reject) {
                cryptoService.hashPassword(masterPassword, key, function (hashedPassword) {
                    var request = new RegisterRequest(email, hashedPassword, hint);
                    apiService.postRegister(request,
                        function () {
                            resolve();
                        },
                        function (error) {
                            reject(error);
                        });
                });
            });
        }
    });