/*******************************************************************************
 * Copyright 2019 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
 
let observations = [
  {
    name: "fluid_output",
    ordering: 1
  },
  {
    name: "blood_pressure",
    ordering: 2,
    sub_metrics: [
      {
        name: "systolic_blood_pressure"
      },
      {
        name: "diastolic_blood_pressure",
      }
    ]
  },
  {
    name: "body_temperature",
    ordering: 3
  },
  {
    name: "heart_rate",
    ordering: 4
  },
  {
    name: "fluid_intake",
    ordering: 5
  },
  {
    name: "respiratory_rate",
    ordering: 6
  },
  {
    name: "bowel_movement",
    ordering: 7
  },
  {
    name: "move_reminder",
    ordering: 8
  }
]

module.exports = {
  observations
}