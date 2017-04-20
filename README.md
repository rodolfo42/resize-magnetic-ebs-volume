# resize-magnetic-ebs-volume

This script "resizes" an EBS volume by performing the following actions:
  1. detaching the volume from the a stopped instance
  2. creating a snapshot from that volume
  3. creating a bigger volume from that snapshot (in the same availability zone)
  4. attaching the new volume to the instance (in the same device location)
  
It must be used pointing to an instance that is:
  - in a 'stopped' state
  - backed by a single EBS volume of standard (AKA magnetic) type
  
It does not:
  - start/stop or modify any instance
  - delete anything (e.g. the old volume)
  - try to kill you

It also expects AWS credentials to be loaded in the environment.

## Why only magnetic?

Technically, it does work for volumes of any type, but so does modifying the volumes themselves for types other than `standard`, so that could be the preferred approach. This was just written to solve a specific problem.

If you really want to use it for volumes of any type, you can comment the line where it checks the volume type [here](https://gist.github.com/rodolfo42/86e158547683c60df0dfdd3f689bc1b0#file-resize-magnetic-ebs-volume-L120).

## Installation

```shell
yarn # or npm install
./resize-magnetic-ebs-volume --instance-id INSTANCE_ID --availability-zone AVAILABILITY_ZONE --to-size NEW_SIZE_GB [--region REGION]
```