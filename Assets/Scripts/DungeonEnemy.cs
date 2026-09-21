using UnityEngine;
public class DungeonEnemy : MonoBehaviour
{
    public float health=50f,speed=2.2f,attackRange=1.5f,attackDamage=8f;float timer;DungeonPlayer player;
    void Start(){player=DungeonGame.Instance.Player;}
    void Update(){
        if(!player)return;Vector3 d=player.transform.position-transform.position;d.y=0;float dist=d.magnitude;
        if(dist>attackRange){transform.position+=d.normalized*speed*Time.deltaTime;if(d.sqrMagnitude>.01f)transform.rotation=Quaternion.LookRotation(d);}
        else{timer-=Time.deltaTime;if(timer<=0){timer=1.1f;player.TakeDamage(attackDamage);}}
    }
    public void TakeDamage(float a){health-=a;if(health<=0){DungeonGame.Instance.AddKill();Drop();Destroy(gameObject);}}
    void Drop(){if(Random.value>.8f)return;var d=GameObject.CreatePrimitive(PrimitiveType.Sphere);d.name="DroppedIngredient";d.transform.position=transform.position+Vector3.up*.5f;d.transform.localScale=Vector3.one*.6f;d.AddComponent<DungeonPickup>();}
}