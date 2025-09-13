================================================
FILE: proto/zmk/behaviors.options.in
================================================
[Empty file]

================================================
FILE: proto/zmk/behaviors.proto
================================================
syntax = "proto3";

package zmk.behaviors;

message Request {
oneof request_type {
bool list_all_behaviors = 1;
GetBehaviorDetailsRequest get_behavior_details = 2;
}
}

message GetBehaviorDetailsRequest {
uint32 behavior_id = 1;
}

message Response {
oneof response_type {
ListAllBehaviorsResponse list_all_behaviors = 1;
GetBehaviorDetailsResponse get_behavior_details = 2;
}
}

message ListAllBehaviorsResponse {
repeated uint32 behaviors = 1;
}

message GetBehaviorDetailsResponse {
uint32 id = 1;
string display_name = 2;
repeated BehaviorBindingParametersSet metadata = 3;
}

message BehaviorBindingParametersSet {
repeated BehaviorParameterValueDescription param1 = 1;
repeated BehaviorParameterValueDescription param2 = 2;
}

message BehaviorParameterValueDescriptionRange {
int32 min = 1;
int32 max = 2;
}

message BehaviorParameterNil {}
message BehaviorParameterLayerId {}
message BehaviorParameterHidUsage {
uint32 keyboard_max = 1;
uint32 consumer_max = 2;
}

message BehaviorParameterValueDescription {
string name = 1;

    oneof value_type {
        BehaviorParameterNil nil = 2;
        uint32 constant = 3;
        BehaviorParameterValueDescriptionRange range = 4;
        BehaviorParameterHidUsage hid_usage = 5;
        BehaviorParameterLayerId layer_id = 6;
    }

}

================================================
FILE: proto/zmk/core.proto
================================================
syntax = "proto3";

package zmk.core;

enum LockState {
ZMK_STUDIO_CORE_LOCK_STATE_LOCKED = 0;
ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED = 1;
}

message Request {
oneof request_type {
bool get_device_info = 1;
bool get_lock_state = 2;
bool lock = 3;
bool reset_settings = 4;
}
}

message Response {
oneof response_type {
GetDeviceInfoResponse get_device_info = 1;
LockState get_lock_state = 2;
bool reset_settings = 4;
}
}

message GetDeviceInfoResponse {
string name = 1;
bytes serial_number = 2;
}

message Notification {
oneof notification_type {
LockState lock_state_changed = 1;
}
}

================================================
FILE: proto/zmk/keymap.options.in
================================================
zmk.keymap.SetLayerPropsRequest.name max_size:@CONFIG_ZMK_KEYMAP_LAYER_NAME_MAX_LEN@ fixed_length:true

================================================
FILE: proto/zmk/keymap.proto
================================================
syntax = "proto3";

package zmk.keymap;

message Request {
oneof request_type {
bool get_keymap = 1;
SetLayerBindingRequest set_layer_binding = 2;
bool check_unsaved_changes = 3;
bool save_changes = 4;
bool discard_changes = 5;
bool get_physical_layouts = 6;
uint32 set_active_physical_layout = 7;
MoveLayerRequest move_layer = 8;
AddLayerRequest add_layer = 9;
RemoveLayerRequest remove_layer = 10;
RestoreLayerRequest restore_layer = 11;
SetLayerPropsRequest set_layer_props = 12;
}
}

message Response {
oneof response_type {
Keymap get_keymap = 1;
SetLayerBindingResponse set_layer_binding = 2;
bool check_unsaved_changes = 3;
SaveChangesResponse save_changes = 4;
bool discard_changes = 5;
PhysicalLayouts get_physical_layouts = 6;
SetActivePhysicalLayoutResponse set_active_physical_layout = 7;
MoveLayerResponse move_layer = 8;
AddLayerResponse add_layer = 9;
RemoveLayerResponse remove_layer = 10;
RestoreLayerResponse restore_layer = 11;
SetLayerPropsResponse set_layer_props = 12;
}
}

message Notification {
oneof notification_type {
bool unsaved_changes_status_changed = 1;
}
}

message SaveChangesResponse {
oneof result {
bool ok = 1;
SaveChangesErrorCode err = 2;
}
}

enum SaveChangesErrorCode {
SAVE_CHANGES_ERR_OK = 0;
SAVE_CHANGES_ERR_GENERIC = 1;
SAVE_CHANGES_ERR_NOT_SUPPORTED = 2;
SAVE_CHANGES_ERR_NO_SPACE = 3;
}

enum SetLayerBindingResponse {
SET_LAYER_BINDING_RESP_OK = 0;
SET_LAYER_BINDING_RESP_INVALID_LOCATION = 1;
SET_LAYER_BINDING_RESP_INVALID_BEHAVIOR = 2;
SET_LAYER_BINDING_RESP_INVALID_PARAMETERS = 3;
}

message SetActivePhysicalLayoutResponse {
oneof result {
Keymap ok = 1;
SetActivePhysicalLayoutErrorCode err = 2;
}
}

enum MoveLayerErrorCode {
MOVE_LAYER_ERR_OK = 0;
MOVE_LAYER_ERR_GENERIC = 1;
MOVE_LAYER_ERR_INVALID_LAYER = 2;
MOVE_LAYER_ERR_INVALID_DESTINATION = 3;
}

message MoveLayerResponse {
oneof result {
Keymap ok = 1;
MoveLayerErrorCode err = 2;
}
}

message AddLayerResponse {
oneof result {
AddLayerResponseDetails ok = 1;
AddLayerErrorCode err = 2;
}
}

enum AddLayerErrorCode {
ADD_LAYER_ERR_OK = 0;
ADD_LAYER_ERR_GENERIC = 1;
ADD_LAYER_ERR_NO_SPACE = 2;
}

message AddLayerResponseDetails {
uint32 index = 1;
Layer layer = 2;
}

message RemoveLayerResponse {
oneof result {
RemoveLayerOk ok = 1;
RemoveLayerErrorCode err = 2;
}
}

message RemoveLayerOk {
}

enum RemoveLayerErrorCode {
REMOVE_LAYER_ERR_OK = 0;
REMOVE_LAYER_ERR_GENERIC = 1;
REMOVE_LAYER_ERR_INVALID_INDEX = 2;
}

message RestoreLayerResponse {
oneof result {
Layer ok = 1;
RestoreLayerErrorCode err = 2;
}
}

enum RestoreLayerErrorCode {
RESTORE_LAYER_ERR_OK = 0;
RESTORE_LAYER_ERR_GENERIC = 1;
RESTORE_LAYER_ERR_INVALID_ID = 2;
RESTORE_LAYER_ERR_INVALID_INDEX = 3;
}

enum SetLayerPropsResponse {
SET_LAYER_PROPS_RESP_OK = 0;
SET_LAYER_PROPS_RESP_ERR_GENERIC = 1;
SET_LAYER_PROPS_RESP_ERR_INVALID_ID = 2;
}

enum SetActivePhysicalLayoutErrorCode {
SET_ACTIVE_PHYSICAL_LAYOUT_ERR_OK = 0;
SET_ACTIVE_PHYSICAL_LAYOUT_ERR_GENERIC = 1;
SET_ACTIVE_PHYSICAL_LAYOUT_ERR_INVALID_LAYOUT_INDEX = 2;
}

message SetLayerBindingRequest {
uint32 layer_id = 1;
int32 key_position = 2;

    BehaviorBinding binding = 3;

}

message MoveLayerRequest {
uint32 start_index = 1;
uint32 dest_index = 2;
}

message AddLayerRequest {
}

message RemoveLayerRequest {
uint32 layer_index = 1;
}

message RestoreLayerRequest {
uint32 layer_id = 1;
uint32 at_index = 2;
}

message SetLayerPropsRequest {
uint32 layer_id = 1;
string name = 2;
}

message Keymap {
repeated Layer layers = 1;
uint32 available_layers = 2;
uint32 max_layer_name_length = 3;
}

message Layer {
uint32 id = 1;
string name = 2;
repeated BehaviorBinding bindings = 3;
}

message BehaviorBinding {
sint32 behavior_id = 1;
uint32 param1 = 2;
uint32 param2 = 3;
}

message PhysicalLayouts {
uint32 active_layout_index = 1;
repeated PhysicalLayout layouts = 2;
}

message PhysicalLayout {
string name = 1;
repeated KeyPhysicalAttrs keys = 2;
}

message KeyPhysicalAttrs {
sint32 width = 1;
sint32 height = 2;
sint32 x = 3;
sint32 y = 4;
sint32 r = 5;
sint32 rx = 6;
sint32 ry = 7;
}

================================================
FILE: proto/zmk/meta.proto
================================================
syntax = "proto3";

package zmk.meta;

enum ErrorConditions {
GENERIC = 0;
UNLOCK_REQUIRED = 1;
RPC_NOT_FOUND = 2;
MSG_DECODE_FAILED = 3;
MSG_ENCODE_FAILED = 4;
}

message Response {
oneof response_type {
bool no_response = 1;
ErrorConditions simple_error = 2;
}
}

================================================
FILE: proto/zmk/studio.options.in
================================================
[Empty file]

================================================
FILE: proto/zmk/studio.proto
================================================
// Requests
syntax = "proto3";

package zmk.studio;

import "meta.proto";
import "core.proto";
import "behaviors.proto";
import "keymap.proto";

message Request {
uint32 request_id = 1;

    oneof subsystem {
        zmk.core.Request core = 3;
        zmk.behaviors.Request behaviors = 4;
        zmk.keymap.Request keymap = 5;
    }

}

message Response {
oneof type {
RequestResponse request_response = 1;
Notification notification = 2;
}
}

message RequestResponse {
uint32 request_id = 1;
oneof subsystem {
zmk.meta.Response meta = 2;
zmk.core.Response core = 3;
zmk.behaviors.Response behaviors = 4;
zmk.keymap.Response keymap = 5;
}
}

message Notification {
oneof subsystem {
zmk.core.Notification core = 2;
zmk.keymap.Notification keymap = 5;
}
}
