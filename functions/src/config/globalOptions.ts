import {setGlobalOptions} from "firebase-functions/v2";

import {REGION} from "../shared/constants";

setGlobalOptions({region: REGION, maxInstances: 10});
