# Fleet MDM plan

This proposal aims to document the plan to make Fleet an MDM server for Apple devices (see [*MDM Protocol Reference*](https://developer.apple.com/business/documentation/MDM-Protocol-Reference.pdf)).

## MVP requirements

- **On-premises**, meaning customers can run Fleet with MDM functionality on their infrastructure.
- Solution must be **100% open source**.
- **Ease of deployment**, meaning as few new dependencies as possible.
- MVP will be headless:
    - All MDM functionality will be available via `fleetctl` commands only.
    - However, all new APIs must be designed and implemented to be consumed by UI at a later iteration.
    - Initially, there won't be `edit` commands for entities. The admin will have to use `list`, `delete`, and `create`...
- Apple credentials should not be stored in MySQL or they should be stored encrypted. Fleet should receive key material via environment variables. (The customer will be in charge of storing them securely on a KMS.)
    - We will document what configuration needs secure storage/management.

## Deliverable

🐶 Dogfood-MVP: Fleet with MDM functionality to be used by Fleet's dogfood instance.
Agreed upon simplifications:
- We will not make use of the "teams" feature for MDM. In other words, all MDM settings and entities will be applied globally.
- All MDM interface will be through `fleetctl` commands: `fleetctl apple-mdm <commands>`.

This document describes the plan for the "Dogfood-MVP" deliverable. 

The PoC can be found in: https://github.com/fleetdm/fleet/tree/apple-mdm.

## Dependencies

- MySQL >= 8.0.19 (because nanoMDM modules require it)
- S3 object storage (for Munki).

## High-level architecture

### MDM functionality and services

We will make use of the most widely-used open-source MDM project: [MicroMDM](https://github.com/micromdm).

To implement an MDM server, we will embed the following three "nanoMDM" modules into Fleet:
1. SCEP service: https://github.com/micromdm/scep
2. MDM core: https://github.com/micromdm/nanomdm
3. DEP functionality: https://github.com/micromdm/nanodep

Such modules contain all the functionality and APIs/endpoints needed to implement an MDM server.

For more information around "micro" vs "nano" MDM, see [*Introducting NanoMDM*](https://micromdm.io/blog/introducing-nanomdm/).

Architecture of the current PoC:
```mermaid
flowchart LR

subgraph Fleet [Fleet Server]

    direction TB;

    enroll[".mobileconfig<br>/mdm/apple/api/enroll"];
    subgraph nanoMDMModules ["nanoMDM modules"]
        direction TB;
        nanoSCEP["nanoSCEP<br>/mdm/apple/scep"];
        nanoMDM["nanoMDM<br>/mdm/apple/mdm"];
        nanoDEP["nanoDEP<br>/mdm/apple/dep/proxy"];
    end
    MunkiRepo["Munki Repository<br>/mdm/apple/munki/repo"];
    subgraph MunkiPkg [Munki Package Server];
        manifest["manifest<br>/mdm/apple/munki/manifest"]
        munkitools["munkitools-*.pkg<br>(signed)<br>/mdm/apple/munki/pkg"]
    end
    subgraph MySQL
        direction LR;
        mdmAppleDB[(nanoMDM<br>Schemas)];
        fleetDB[(fleet)];
    end
end

ApplePush[https://api.push.apple.com];
AppleDEP[https://mdmenrollment.apple.com];
nanoDEP -- Apple MDM DEP API ----> AppleDEP;
nanoMDM --> ApplePush;

nanoDEP --> mdmAppleDB;
nanoMDM --> mdmAppleDB;
```

## Plan for Dogfood-MVP

### Setup

See [Fleet MDM setup](./setup.md).

### Authority

Only global admins will be allowed to use MDM functionality.

### MDM features

#### Enrollments

"Enrollments" hold some settings for devices that will be enrolled to MDM.
The MDM "enrollments" will allow Fleet to automatically enroll devices to specific teams, which then allows for applying specific MDM settings (depending on the team).

For Dogfood-MVP, Fleet will allow creating global enrollments only (team support will be added at a subsequent iteration).
Users will be able to create the two following types of enrollments:
- Global manual enrollment
- Global DEP enrollment

We'll have a new `apple_enrollments` table with the following fields:
- ID (to deduce an "Enroll URL")
- Name
- Automatic (bool)
- Configuration (JSON?)
- Team (0 for global)

Fleetctl commands (and APIs):
- Create enrollments:
	`fleetctl apple-mdm enrollments create-automatic --name=Foo --configuration=<TBD>`
	`fleetctl apple-mdm enrollments create-manual --name=Bar --configuration=<TBD>`

- List enrollments (the "global" manual enroll and the DEP enroll):
	`fleetctl apple-mdm enrollments list`

#### Custom commands for DEP enrollments

- List DEP devices: DEP devices of that enrollment and their status (using the "DEP proxy API").
	`fleetctl apple-mdm enrollments dep list`
- Sync DEP profiles: makes sure to set the enroll profile for new devices in a DEP enrollment. (Fleet would sync all DEP enrollments automatically every 5m.)
	`fleetctl apple-mdm enrollments dep sync-profiles`

#### DEP syncer

Fleet runs a "DEP syncer" routine to fetch newly added devices to business.apple.com and automatically apply DEP enroll configuration to them.

### Hosts

Initially, we want to account for hosts that are MDM enrolled but not in osquery.
TODO(Lucas): We'll need to test whether our system and UI support a `hosts` entry w/ an empty `osquery_host_id`...

### MDM commands

These are one-off commands like "DeviceLock", "RestartDevice", etc.

Fleetctl commands:
- Send command:
	`fleetctl apple-mdm commands send --target-hosts=1,2,3 --command=foo.plist`
(fleetctl would be agnostic to contents of "foo.plist")
- List commands (with their status):
	`fleetctl apple-mdm commands list`

### MDM profiles

A profile is defined as:
- ID
- UUID
- Name
- Payload (raw XML plist)
- Team (NULL for global)

For MVP-dogfood, we will only have global profiles, and as such, they are applied to all MDM enrolled hosts.

TODO(Lucas): Stuff to solve around this feature:
So, we have a list of all the profiles to apply to devices. How does Fleet know which profiles are
already deployed on a device and which aren't? (Are there any APIs to poll that work at scale?)

Fleetctl commands (and APIs) to:
- Create global profiles:
	`fleetctl apple-mdm profiles create --name="Chrome_Enrollment" --payload=foo.xml`
- List profile(s) (displays ID/UUID):
	`fleetctl apple-mdm profiles list`
- Delete profiles:
	`fleetctl apple-mdm profiles delete`
  TODO(Lucas): It will delete the profile from all hosts.

### Application deployment

See [Application deployment](./application-deployment.md).