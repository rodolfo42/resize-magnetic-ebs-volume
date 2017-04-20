const _ = require('lodash');

let snapCompleted = false;
let snapStartTime;
let instanceStarted = 0;
let volumeAttached = false;

module.exports = {
  describeInstances: function describeInstanceStatus(params) { return { promise: () => {
    return Promise.resolve({
      Reservations: [{
        Instances: [{
          InstanceId: _.head(params.InstanceIds),
          State: {
            Name: (instanceStarted === 0) ? 'stopped': (instanceStarted === 0.5 ? 'pending' : 'running')
          },
          Placement: {
            AvailabilityZone: 'uv-jupiter-2b'
          }
        }]
      }]
    });
  }}},
  createVolume: function createVolume(params) { return { promise: () => {
    return Promise.resolve({
      AvailabilityZone: params.AvailabilityZone, 
      Size: params.Size,
      VolumeType: params.VolumeType,
      VolumeId: 'vol-new',
      CreateTime: new Date().toISOString()
    });
  }}},
  describeVolumes: function describeVolumes(params) { return { promise: () => {
    const { VolumeIds } = params;
    const volumeId = _.head(VolumeIds);
    if (volumeId) {
      return Promise.resolve({
        Volumes: [{
          VolumeId: volumeId,
          VolumeType: (volumeId === 'vol-created') ? 'gp2' : 'standard',
          Size: (volumeId === 'vol-created') ? 25 : 8,
          State: (volumeAttached ? 'in-use' : 'available'),
          CreateTime: new Date().toISOString(),
          AvailabilityZone: 'uv-jupiter-2b',
          Attachments: (volumeAttached) ? [{
            Device: '/dev/xvda1'
          }] : []
        }]
      });
    } else {
      return Promise.resolve({
        Volumes: [{
          VolumeId: 'vol-source',
          VolumeType: 'standard',
          Size: 8,
          State: 'available',
          CreateTime: new Date().toISOString(),
          AvailabilityZone: 'uv-jupiter-2b',
          Attachments: [{
            Device: '/dev/xvda1'
          }]
        }]
      });
    }
  }}},
  attachVolume: function detachVolume(params) { return { promise: () => {
    volumeAttached = true;
    return Promise.resolve({});
  }}},
  detachVolume: function detachVolume(params) { return { promise: () => {
    return Promise.resolve({
      VolumeId: params.VolumeId,
      InstanceId: params.InstanceId,
      State: 'detaching'
    });
  }}},
  createSnapshot: function createSnapshot(params) { return { promise: () => {
    snapStartTime = snapStartTime || (new Date()).toISOString();
    return Promise.resolve({
      VolumeId: params.VolumeId,
      Description: params.Description,
      SnapshotId: 'snap-created',
      StartTime: snapStartTime,
      State: 'pending',
      VolumeId: 'vol-source',
    });
  }}},
  describeSnapshots: function describeSnapshots(params) { return { promise: () => {
    const snap = {
      Snapshots: [{
        SnapshotId: _.head(params.SnapshotIds),
        VolumeId: 'vol-source',
        State: (snapCompleted ? 'completed' : 'pending'),
        Progress: (snapCompleted ? '100%' : '42%'),
        StartTime: snapStartTime,
      }]
    };
    snapCompleted = true;
    return Promise.resolve(snap);
  }}},
  startInstances: function startInstances(params) { return { promise: () => {
    instanceStarted = 0.5;
    setTimeout(() => { instanceStarted = 1; }, 15 * 1000)
    return Promise.resolve({});
  }}},
}