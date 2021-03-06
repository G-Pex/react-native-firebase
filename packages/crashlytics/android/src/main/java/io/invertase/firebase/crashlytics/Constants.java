package io.invertase.firebase.crashlytics;

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

class Constants {
  final static String EMPTY_APPLICATION_ID_PROVIDER_AUTHORITY = BuildConfig.APPLICATION_ID + ".reactnativefirebasecrashlyticsinitprovider";
  final static String KEY_CRASHLYTICS_NDK_ENABLED = "crashlytics_ndk_enabled";
  final static String KEY_CRASHLYTICS_DEBUG_ENABLED = "crashlytics_debug_enabled";
  final static String KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED = "crashlytics_auto_collection_enabled";
}
