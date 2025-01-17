import { FileData } from "./FileDataHelper";
import { Decryptable } from "src/features/feature-inplace-encrypt/Decryptable";
import { CryptoHelper } from "./CryptoHelper";
import { ICryptoHelper } from "./ICryptoHelper";
import { CryptoHelper2304 } from "./CryptoHelper2304";
import { CryptoHelperObsolete } from "./CryptoHelperObsolete";

export class CryptoHelperFactory{

	public static BuildDefault(): ICryptoHelper{
		console.log("BuildDefault CryptoHelper2304( 16, 16, 210000 )");
		return new CryptoHelper2304( 16, 16, 210000 );
	}

	public static BuildFromFileDataOrThrow( data: FileData ) : ICryptoHelper {
		const result = CryptoHelperFactory.BuildFromFileDataOrNull(data);
		if ( result != null ){
			return result;
		}
		throw new Error( `Unable to determine ICryptoHelper for File ver ${data.version}`);
	}

	public static BuildFromFileDataOrNull( data: FileData ) : ICryptoHelper | null {
		if ( data.version == '1.0' ){
			console.log("BuildFromFileDataOrNull v1 new CryptoHelper()");
			return new CryptoHelper();
		}
		
		// note				v2.0	CryptoHelper2304
		if ( data.version == '2.0' ){
			console.log("BuildFromFileDataOrNull v2 new CryptoHelper2304( 16, 16, 210000  )");
			return new CryptoHelper2304( 16, 16, 210000  );
		}

		return null;
	}

	public static BuildFromDecryptableOrThrow( decryptable: Decryptable ) : ICryptoHelper {
		const result = CryptoHelperFactory.BuildFromDecryptableOrNull( decryptable );

		if (result != null){
			return result;
		}
		throw new Error( `Unable to determine ICryptoHelper for Decryptable ver ${decryptable.version}`);
	}

	public static BuildFromDecryptableOrNull( decryptable: Decryptable ) : ICryptoHelper | null {
		// Versions
		// inplace original	_PREFIX_OBSOLETE = '%%🔐 '  CryptoHelperObsolete
		
		// inplace alpha	_PREFIX_A = '%%🔐α '		CryptoHelper
		// 					_PREFIX_A_VISIBLE = '🔐α '	CryptoHelper

		// inplace beta 	_PREFIX_B = '%%🔐β '		CryptoHelper2304( 16, 16, 210000 )
		//					_PREFIX_B_VISIBLE = '🔐β '	CryptoHelper2304( 16, 16, 210000 )
		
		if ( decryptable.version == 0 ){
			console.log("BuildFromDecryptableOrNull new CryptoHelperObsolete()");
			
			return new CryptoHelperObsolete();
		}
		
		if ( decryptable.version == 1 ){
			console.log("BuildFromDecryptableOrNull new CryptoHelper()");
			return new CryptoHelper();
		}
		
		if ( decryptable.version == 2 ){
			console.log("BuildFromDecryptableOrNull new CryptoHelper2304( 16, 16, 210000 )");
			return new CryptoHelper2304( 16, 16, 210000 );
		}

		return null;
	}

}