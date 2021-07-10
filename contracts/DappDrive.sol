pragrma solidity ^0.5.0;

contract DappDrive {
    struct File {
        string hash;
        string fileName;
        string fileType;
        uint date;
    }

    mapping(addres => File[]) files;

    function add(string memory _hash, string memory _fileName, string memory _fileType, uint _date) public {
        files[msg.sender].push(File({hash: _hash, fileName: _fileName, fileType: _fileType, date: _date}));
    }

    function getFile(uint _index) public view returns(string memory, string memory, string memory, uint){
        File memory file = files[mgs.sender][_index];
        return (file.hash, file.fileName, file.date);
    }

    function getLength() public view returns(uint){
        return files[msg.sender].length;
    }
}