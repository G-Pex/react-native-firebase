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

import {
  ReactNativeFirebaseModule,
  ReactNativeFirebaseNamespace,
  ReactNativeFirebaseModuleAndStatics,
} from '@react-native-firebase/app-types';

/**
 * Storage
 *
 * @firebase storage
 */
export namespace Storage {
  export enum TaskEvent {
    STATE_CHANGED = 'state_changed',
  }

  export enum TaskState {
    CANCELLED = 'cancelled',
    ERROR = 'error',
    PAUSED = 'paused',
    RUNNING = 'running',
    SUCCESS = 'success',
  }

  export interface Statics {
    TaskState: TaskState;
    TaskEvent: TaskState;
    Native: {
      /**
       * Main Bundle Path
       */
      MAIN_BUNDLE_PATH: string;

      CACHES_DIRECTORY_PATH: string;
      /**
       * Document Directory Path
       */
      DOCUMENT_DIRECTORY_PATH: string;
      EXTERNAL_DIRECTORY_PATH: string;
      EXTERNAL_STORAGE_DIRECTORY_PATH: string;
      /**
       * Store Temp Files here
       */
      TEMP_DIRECTORY_PATH: string;
      LIBRARY_DIRECTORY_PATH: string;
      FILETYPE_REGULAR: string;
      FILETYPE_DIRECTORY: string;
    };
  }

  export interface Module extends ReactNativeFirebaseModule {

  }
}

declare module '@react-native-firebase/storage' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/storage';
   * firebase.storage().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const StorageDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Storage.Module,
    Storage.Statics
  >;
  /**
   * @example
   * ```js
   * import storage from '@react-native-firebase/storage';
   * storage().X(...);
   * ```
   */
  export default StorageDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Storage
     */
    storage: ReactNativeFirebaseModuleAndStatics<
      Storage.Module,
      Storage.Statics
    >;
  }

  interface FirebaseApp {
    /**
     * Storage
     */
    storage(): Storage.Module;
  }
}
