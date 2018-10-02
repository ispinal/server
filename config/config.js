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