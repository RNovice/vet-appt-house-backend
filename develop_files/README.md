# development documentation

### **Permission Codes**

| Code | Binary | Description                                                                                          |
|------|--------|------------------------------------------------------------------------------------------------------|
| 444  | `100100100` | **Read-only for everyone** (all users, including unauthenticated, can only read the resource).    |
| 640  | `110100000` | **Read-write for owner only** (only the owner of the resource can read and write).               |
| 644  | `110100100` | **Read-only for everyone, write for owner** (authenticated users can read, owner can write).     |
| 660  | `110110000` | **Read-write for owner, no access for others** (owner can read/write, others have no access).    |
| 600  | `110000000` | **No public access, read-write for owner** (only the owner can access the resource).             |
| 777  | `111111111` | **Full access for everyone** (all users, authenticated or not, can read, write, and delete).     |
| 700  | `111000000` | **Full access for owner only** (only the owner can read, write, and delete).                     |
| 755  | `111101101` | **Owner has full access, others can only read**.                                                 |
| 775  | `111111101` | **Owner has full access, others can read and write.**                                            |

---

Each permission code is based on **Unix-like file system permissions** and consists of three digits:

1. **First Digit** - **Owner (user)**:
   - Defines access for the resource owner.
   - `7`: Full access (read/write/delete).
   - `6`: Read/write access.
   - `4`: Read-only access.

2. **Second Digit** - **Group (authenticated users)**:
   - Defines access for logged-in users.
   - `7`: Full access (read/write/delete).
   - `6`: Read/write access.
   - `4`: Read-only access.
   - `0`: No access.

3. **Third Digit** - **Other (unauthenticated users)**:
   - Defines access for public users (not logged in).
   - `7`: Full access (read/write/delete).
   - `6`: Read/write access.
   - `4`: Read-only access.
   - `0`: No access.
