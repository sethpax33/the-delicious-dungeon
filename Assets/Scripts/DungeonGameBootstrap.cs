using System.Collections.Generic;
using UnityEngine;

public static class DungeonGameBootstrap
{
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    private static void Boot()
    {
        if (Object.FindFirstObjectByType<DungeonGame>() == null)
            new GameObject("DungeonGame").AddComponent<DungeonGame>();
    }
}

public class DungeonGame : MonoBehaviour
{
    public static DungeonGame Instance { get; private set; }
    public DungeonPlayer Player { get; private set; }
    public int Ingredients { get; private set; }
    public int Coins { get; private set; }
    public int DungeonKills { get; private set; }
    public float DamageMultiplier { get; private set; } = 1f;

    private Transform worldRoot;
    private Material floorMat, wallMat, trimMat, enemyMat, playerMat, herbMat, fireMat;

    void Awake()
    {
        if (Instance != null) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);
        BuildGame();
    }

    public void AddIngredient() { Ingredients++; DungeonHUD.Refresh(); }
    public void AddKill() { DungeonKills++; Coins += 10; DungeonHUD.Refresh(); }

    public bool Cook()
    {
        if (Ingredients < 3) { DungeonHUD.ShowMessage("You need 3 ingredients to cook."); return false; }
        Ingredients -= 3;
        DamageMultiplier = Mathf.Min(1.75f, DamageMultiplier + 0.25f);
        Player.RestoreHealth(30);
        DungeonHUD.ShowMessage("Hearty dungeon meal! +30 HP and stronger attacks.");
        DungeonHUD.Refresh();
        return true;
    }

    void BuildGame()
    {
        worldRoot = new GameObject("GeneratedDungeon").transform;
        CreateMaterials();
        BuildDungeon();
        BuildPlayer();
        BuildEnemies();
        BuildCookingStation();
        BuildLighting();
        DungeonHUD.Create();
        DungeonHUD.ShowMessage("Enter the dungeon. Defeat monsters, collect ingredients, cook.");
    }

    void CreateMaterials()
    {
        floorMat = Mat(new Color(.10f,.08f,.07f), .15f);
        wallMat = Mat(new Color(.22f,.20f,.19f), .05f);
        trimMat = Mat(new Color(.38f,.25f,.13f), .35f);
        enemyMat = Mat(new Color(.32f,.08f,.06f), .1f);
        playerMat = Mat(new Color(.12f,.28f,.55f), .2f);
        herbMat = Mat(new Color(.12f,.55f,.18f), .1f);
        fireMat = Mat(new Color(1f,.25f,.03f), .5f);
    }

    Material Mat(Color c, float metallic)
    {
        Shader s = Shader.Find("Universal Render Pipeline/Lit");
        if (s == null) s = Shader.Find("Standard");
        var m = new Material(s);
        m.color = c;
        m.SetFloat("_Metallic", metallic);
        m.SetFloat("_Smoothness", .35f);
        return m;
    }

    void BuildDungeon()
    {
        Room(new Vector3(0,0,0), new Vector2(18,14));
        Room(new Vector3(0,0,22), new Vector2(18,14));
        Room(new Vector3(24,0,0), new Vector2(16,14));
        Room(new Vector3(-24,0,0), new Vector2(16,14));
        Room(new Vector3(0,0,-22), new Vector2(18,14));
        Corridor(new Vector3(0,0,10), new Vector3(0,0,12), 5);
        Corridor(new Vector3(9,0,0), new Vector3(15,0,0), 5);
        Corridor(new Vector3(-9,0,0), new Vector3(-15,0,0), 5);
        Corridor(new Vector3(0,0,-10), new Vector3(0,0,-12), 5);

        for (int i=0;i<22;i++)
        {
            float x=Random.Range(-30f,30f), z=Random.Range(-27f,27f);
            if (Mathf.Abs(x)<10 && Mathf.Abs(z)<9) continue;
            Pickup(new Vector3(x,.65f,z));
        }
    }

    void Room(Vector3 center, Vector2 size)
    {
        Cube("Floor",center+Vector3.down*.5f,new Vector3(size.x,1,size.y),floorMat);
        float h=4f,t=1f;
        Cube("Wall",center+new Vector3(0,h/2,size.y/2),new Vector3(size.x,h,t),wallMat);
        Cube("Wall",center+new Vector3(0,h/2,-size.y/2),new Vector3(size.x,h,t),wallMat);
        Cube("Wall",center+new Vector3(size.x/2,h/2,0),new Vector3(t,h,size.y),wallMat);
        Cube("Wall",center+new Vector3(-size.x/2,h/2,0),new Vector3(t,h,size.y),wallMat);
        Cube("Trim",center+new Vector3(0,h+.15f,size.y/2),new Vector3(size.x+.2f,.3f,1.2f),trimMat);
        Cube("Trim",center+new Vector3(0,h+.15f,-size.y/2),new Vector3(size.x+.2f,.3f,1.2f),trimMat);
    }

    void Corridor(Vector3 a,Vector3 b,float width)
    {
        Vector3 mid=(a+b)/2f;
        float length=Vector3.Distance(a,b);
        bool xAxis=Mathf.Abs(a.x-b.x)>Mathf.Abs(a.z-b.z);
        Cube("CorridorFloor",mid+Vector3.down*.5f,
            xAxis?new Vector3(length,1,width):new Vector3(width,1,length),floorMat);
    }

    void Pickup(Vector3 pos)
    {
        var go=GameObject.CreatePrimitive(PrimitiveType.Sphere);
        go.name="Ingredient"; go.transform.SetParent(worldRoot); go.transform.position=pos;
        go.transform.localScale=Vector3.one*.65f;
        go.GetComponent<Renderer>().material=herbMat;
        go.AddComponent<DungeonPickup>();
    }

    void BuildPlayer()
    {
        var go=GameObject.CreatePrimitive(PrimitiveType.Capsule);
        go.name="Player"; go.transform.SetParent(worldRoot); go.transform.position=new Vector3(0,1.1f,0);
        go.GetComponent<Renderer>().material=playerMat;
        var cc=go.AddComponent<CharacterController>(); cc.height=2.1f; cc.radius=.45f;
        Player=go.AddComponent<DungeonPlayer>(); Player.Initialize();
    }

    void BuildEnemies()
    {
        Vector3[] positions={new(5,1,4),new(-5,1,4),new(0,1,27),new(25,1,2),new(-25,1,-2),new(4,1,-25)};
        foreach(var pos in positions)
        {
            var go=GameObject.CreatePrimitive(PrimitiveType.Capsule);
            go.name="DungeonBeast"; go.transform.SetParent(worldRoot); go.transform.position=pos;
            go.GetComponent<Renderer>().material=enemyMat;
            go.AddComponent<DungeonEnemy>();
        }
    }

    void BuildCookingStation()
    {
        var baseGo=Cube("CookingStation",new Vector3(0,1,-4),new Vector3(2.5f,2,1.6f),trimMat);
        var fire=GameObject.CreatePrimitive(PrimitiveType.Sphere);
        fire.name="CookingFire"; fire.transform.SetParent(worldRoot); fire.transform.position=new Vector3(0,2.2f,-4);
        fire.transform.localScale=Vector3.one*.8f; fire.GetComponent<Renderer>().material=fireMat;
        baseGo.AddComponent<CookingStation>().Initialize();
    }

    void BuildLighting()
    {
        RenderSettings.ambientLight=new Color(.08f,.07f,.09f);
        RenderSettings.fog=true; RenderSettings.fogColor=new Color(.055f,.045f,.04f); RenderSettings.fogDensity=.012f;
        var moon=new GameObject("MoonLight"); moon.transform.rotation=Quaternion.Euler(50,-30,0);
        var dl=moon.AddComponent<Light>(); dl.type=LightType.Directional; dl.intensity=.45f; dl.color=new Color(.55f,.62f,1f);
        foreach(var p in new[]{new Vector3(0,3,0),new Vector3(0,3,22),new Vector3(24,3,0),new Vector3(-24,3,0),new Vector3(0,3,-22)})
        {
            var lgo=new GameObject("DungeonLantern"); lgo.transform.position=p;
            var l=lgo.AddComponent<Light>(); l.type=LightType.Point; l.range=10; l.intensity=7; l.color=new Color(1f,.45f,.18f);
        }
    }

    GameObject Cube(string name,Vector3 pos,Vector3 scale,Material mat)
    {
        var go=GameObject.CreatePrimitive(PrimitiveType.Cube);
        go.name=name; go.transform.SetParent(worldRoot); go.transform.position=pos; go.transform.localScale=scale;
        go.GetComponent<Renderer>().material=mat; return go;
    }
}

public class DungeonPickup : MonoBehaviour
{
    void Update(){transform.Rotate(0,90f*Time.deltaTime,0);}
    void OnTriggerEnter(Collider other)
    {
        if(!other.CompareTag("Player")) return;
        DungeonGame.Instance.AddIngredient();
        DungeonHUD.ShowMessage("Ingredient collected.");
        Destroy(gameObject);
    }
}

public class CookingStation : MonoBehaviour
{
    public void Initialize(){var c=gameObject.AddComponent<BoxCollider>();c.isTrigger=true;c.size=new Vector3(2,2,2);}
    void OnTriggerStay(Collider other){if(other.CompareTag("Player")&&Input.GetKeyDown(KeyCode.E))DungeonGame.Instance.Cook();}
}
